import { NextResponse } from 'next/server';
import { validatePhone, validateEmail } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limiter';
import { db } from '@/lib/db';
import { lookupIpLocation } from '@/lib/ip-lookup';

import * as nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

function generateRandomOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, value, countryCode, captchaToken, forceOtp } = body;

    // ── Validate required fields ──
    if (!method || !value) {
      return NextResponse.json(
        { success: false, message: 'Method and value are required' },
        { status: 400 }
      );
    }

    if (method !== 'phone' && method !== 'email' && method !== 'telegram' && method !== 'whatsapp') {
      return NextResponse.json(
        { success: false, message: 'Method must be "phone", "email", "telegram" or "whatsapp"' },
        { status: 400 }
      );
    }

    // ── Validate format based on method ──
    if (method === 'phone' || method === 'whatsapp') {
      if (!validatePhone(value)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid phone number format. Please enter a valid phone number.',
          },
          { status: 400 }
        );
      }
    } else if (method === 'email') {
      if (!validateEmail(value)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email address format' },
          { status: 400 }
        );
      }
    }

    // ── Verify Captcha (Cloudflare Turnstile) ──
    const authSettings = await db.systemSetting.findMany({
      where: {
        key: { in: [
          'auth_captcha_enabled', 'auth_captcha_secret_key', 
          'otp_custom_gateway_enabled', 'otp_custom_gateway_url', 'otp_custom_gateway_token', 'otp_sms_template',
          'otp_whatsapp_enabled', 'otp_whatsapp_url', 'otp_whatsapp_token', 'otp_whatsapp_template',
          'otp_rate_limit_minute', 'otp_rate_limit_phone_daily', 'otp_rate_limit_ip_daily',
          'otp_telegram_bot_username'
        ] }
      }
    });
    const sMap = authSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

    if (sMap.auth_captcha_enabled !== 'false' && sMap.auth_captcha_secret_key) {
      if (!captchaToken) {
        return NextResponse.json({ success: false, message: 'Captcha token is required' }, { status: 400 });
      }

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: sMap.auth_captcha_secret_key,
          response: captchaToken,
        }).toString(),
      });

      const outcome = await verifyRes.json();
      if (!outcome.success) {
        console.error('[send-otp] Captcha verification failed:', outcome);
        return NextResponse.json({ success: false, message: 'Captcha verification failed' }, { status: 400 });
      }
    }

    // ── Rate limits ──
    const limitMinute = parseInt(sMap.otp_rate_limit_minute) || 3;
    const limitPhoneDaily = parseInt(sMap.otp_rate_limit_phone_daily) || 5;
    const limitIpDaily = parseInt(sMap.otp_rate_limit_ip_daily) || 20;

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    let detectedCountry = request.headers.get('cf-ipcountry') || '';
    let detectedCity = request.headers.get('cf-ipcity') || '';
    if (detectedCity) {
      try {
        detectedCity = decodeURIComponent(detectedCity);
      } catch (e) {
        // ignore
      }
    }
    
    // Fallback to IP lookup if Cloudflare didn't provide location
    if (!detectedCountry || !detectedCity) {
      const geo = await lookupIpLocation(ip);
      if (geo.countryCode && !detectedCountry) detectedCountry = geo.countryCode;
      if (geo.city && !detectedCity) detectedCity = geo.city;
    }
    
    // Ensure fallback value
    if (!detectedCountry) detectedCountry = 'Unknown';
    
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const { parseUserAgent } = require('@/lib/ip-lookup');
    const parsedUa = parseUserAgent(userAgent);
    const deviceType = parsedUa.deviceType || 'Unknown';

    // Simple hash function for device fingerprint
    let hash = 0;
    for (let i = 0; i < userAgent.length; i++) {
      hash = ((hash << 5) - hash) + userAgent.charCodeAt(i);
      hash |= 0;
    }
    const deviceFingerprint = Math.abs(hash).toString(16);
    
    // ── Security Check: Banned Entities ──
    const activeBans = await db.bannedEntity.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    let isBanned = false;
    let banReason = null;

    for (const ban of activeBans) {
      if (
        (ban.type === 'ip' && ban.value === ip) ||
        (ban.type === 'phone' && ban.value === value && (method === 'phone' || method === 'whatsapp' || method === 'telegram')) ||
        (ban.type === 'email' && ban.value === value && method === 'email') ||
        (ban.type === 'device' && ban.value === deviceFingerprint) ||
        (ban.type === 'country' && ban.value === detectedCountry)
      ) {
        isBanned = true;
        banReason = ban.reason || 'Security Policy';
        break;
      }
    }

    if (isBanned) {
      // Log the banned attempt
      await db.authLog.create({
        data: {
          identifier: value,
          method,
          ipAddress: ip,
          userAgent,
          countryCode,
          city: detectedCity,
          deviceType: deviceType,
          deviceFingerprint,
          status: 'banned',
          isBanned: true,
          banReason
        }
      });
      return NextResponse.json(
        { success: false, message: 'عذراً، لا يمكنك الوصول إلى هذه الخدمة.' },
        { status: 403 }
      );
    }


    // 1. IP Daily Limit
    const ipDailyLimitKey = `otp-send-ip-daily:${ip}`;
    const ipDailyCheck = checkRateLimit(ipDailyLimitKey, limitIpDaily, 24 * 60 * 60 * 1000);
    if (!ipDailyCheck.allowed) {
      return NextResponse.json(
        { success: false, code: 'ERROR_RATE_LIMIT_IP_DAILY', message: `Too many requests from this IP today.`, retryAfterMs: ipDailyCheck.retryAfterMs },
        { status: 429 }
      );
    }

    // 2. Phone/Email Daily Limit
    const phoneDailyLimitKey = `otp-send-daily:${value}`;
    const phoneDailyCheck = checkRateLimit(phoneDailyLimitKey, limitPhoneDaily, 24 * 60 * 60 * 1000);
    if (!phoneDailyCheck.allowed) {
      return NextResponse.json(
        { success: false, code: 'ERROR_RATE_LIMIT_PHONE_DAILY', message: `Too many requests for this identifier today.`, retryAfterMs: phoneDailyCheck.retryAfterMs },
        { status: 429 }
      );
    }

    // 3. Per Minute Limit
    const rateLimitKey = `otp-send-minute:${method}:${value}`;
    const rateCheck = checkRateLimit(rateLimitKey, limitMinute, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: 'ERROR_RATE_LIMIT_MINUTE',
          message: `Too many requests. Please try again later.`,
          retryAfterMs: rateCheck.retryAfterMs,
        },
        { status: 429 }
      );
    }

    // ── Check if user exists and has a password ──
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: value },
          { phone: value }
        ]
      }
    });

    if (!forceOtp && existingUser && existingUser.password) {
      return NextResponse.json({
        success: true,
        userExistsWithPassword: true,
        message: 'User exists with password. Proceed to password login.',
      });
    }

    // ── Generate OTP ──
    const otpCode = generateRandomOTP();

    // ── Save OTP to Database ──

    // Log the attempt
    await db.authLog.create({
      data: {
        identifier: value,
        method,
        ipAddress: ip,
        userAgent,
        countryCode: detectedCountry,
        city: detectedCity,
        deviceType: deviceType,
        deviceFingerprint,
        status: 'pending',
      }
    });

    await db.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: value,
          token: otpCode, // Note: In a real prod we'd normally delete old ones, or uniquely match.
        }
      },
      update: {
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
      create: {
        identifier: value,
        token: otpCode,
        expires: new Date(Date.now() + 5 * 60 * 1000),
      }
    });

    // ── Send OTP based on Method & Admin Settings ──
    if (method === 'email') {
      // Fetch Email Settings
      const settings = await db.systemSetting.findMany({
        where: {
          key: { in: ['otp_email_enabled', 'otp_smtp_host', 'otp_smtp_port', 'otp_smtp_user', 'otp_smtp_pass', 'otp_smtp_from'] }
        }
      });
      const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

      if (settingsMap.otp_email_enabled === 'true' && settingsMap.otp_smtp_host) {
        try {
          const transporter = nodemailer.createTransport({
            host: settingsMap.otp_smtp_host,
            port: Number(settingsMap.otp_smtp_port) || 587,
            secure: Number(settingsMap.otp_smtp_port) === 465,
            auth: {
              user: settingsMap.otp_smtp_user,
              pass: settingsMap.otp_smtp_pass,
            },
          });

          await transporter.sendMail({
            from: settingsMap.otp_smtp_from || '"ChariDay" <no-reply@chariday.com>',
            to: value,
            subject: 'رمز التحقق الخاص بك (ChariDay)',
            text: `رمز التحقق الخاص بك هو: ${otpCode}`,
            html: `<div style="text-align: center; font-family: sans-serif;">
                    <h2>مرحباً بك في ChariDay</h2>
                    <p>رمز التحقق الخاص بك هو:</p>
                    <h1 style="color: #007aff; letter-spacing: 5px;">${otpCode}</h1>
                    <p>هذا الرمز صالح لمدة 5 دقائق.</p>
                   </div>`,
          });
          console.log(`[OTP] Email sent to ${value}`);
        } catch (emailError) {
          console.error('[send-otp] Email sending failed:', emailError);
          // Fallback to dev mode if email fails, but you might want to return an error in prod
        }
      }
    }

    if (method === 'phone') {
      if (sMap.otp_custom_gateway_enabled === 'true' && sMap.otp_custom_gateway_url) {
        try {
          // Fire and forget to the custom gateway
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (sMap.otp_custom_gateway_token) {
            headers['Authorization'] = sMap.otp_custom_gateway_token.startsWith('Basic ') || sMap.otp_custom_gateway_token.startsWith('Bearer ')
              ? sMap.otp_custom_gateway_token
              : `Bearer ${sMap.otp_custom_gateway_token}`;
          }

          // Don't await if you don't want to block the response, but waiting is safer to catch errors
          const rawTemplate = sMap.otp_sms_template || 'رمز التحقق الخاص بك هو: {otp} (صالح لمدة 5 دقائق)';
          const smsText = rawTemplate.replace('{otp}', otpCode);

          // Enhance URL with query parameters for MacroDroid fallback
          const urlObj = new URL(sMap.otp_custom_gateway_url);
          urlObj.searchParams.set('to', `${countryCode}${value}`);
          urlObj.searchParams.set('message', smsText);

          const gwRes = await fetch(urlObj.toString(), {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to: `${countryCode}${value}`,
              phone: `${countryCode}${value}`, // For Capcom6
              message: smsText,
              otp: otpCode,
              type: 'SMS',
              phoneNumbers: [`${countryCode}${value}`] // Capcom6 new spec
            })
          });

          if (!gwRes.ok) {
            console.error('[send-otp] Custom Gateway returned error:', await gwRes.text());
          } else {
            console.log(`[OTP] Sent to Custom Gateway for ${value}`);
          }
        } catch (gwError) {
          console.error('[send-otp] Custom Gateway call failed:', gwError);
        }
      } else {
        console.log(`[OTP] No Custom Gateway configured for Phone. Fallback to mock/log.`);
      }
    }

    if (method === 'whatsapp') {
      if (sMap.otp_whatsapp_enabled === 'true' && sMap.otp_whatsapp_url) {
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (sMap.otp_whatsapp_token) {
            headers['Authorization'] = `Bearer ${sMap.otp_whatsapp_token}`;
          }

          const rawTemplate = sMap.otp_whatsapp_template || 'رمز التحقق الخاص بك هو: {otp} (صالح لمدة 5 دقائق)';
          const whatsappText = rawTemplate.replace('{otp}', otpCode);

          const gwRes = await fetch(sMap.otp_whatsapp_url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to: `${countryCode}${value}`,
              message: whatsappText,
              otp: otpCode,
              type: 'WhatsApp'
            })
          });

          if (!gwRes.ok) {
            console.error('[send-otp] WhatsApp Gateway returned error:', await gwRes.text());
          } else {
            console.log(`[OTP] Sent to WhatsApp Gateway for ${value}`);
          }
        } catch (gwError) {
          console.error('[send-otp] WhatsApp Gateway call failed:', gwError);
        }
      } else {
        console.log(`[OTP] No WhatsApp Gateway configured. Fallback to mock/log.`);
      }
    }

    if (method === 'telegram') {
      // In a real scenario, this endpoint generates the link that the user clicks.
      // The actual OTP sending happens via the webhook when the user presses start in the bot.
      // Here we just save the token so the bot can verify the deep link.
      console.log(`[OTP] Prepared Telegram verify token for ${value}: ${otpCode}`);
    }

    // Log the OTP for development
    console.log(`[OTP] ${method.toUpperCase()} OTP for ${value}: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300,
      _devCode: otpCode, // Keep for dev testing
      _telegramLink: method === 'telegram' ? `https://t.me/${sMap.otp_telegram_bot_username || 'ChariDayBot'}` : undefined
    });
  } catch (error) {
    console.error('[send-otp] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
