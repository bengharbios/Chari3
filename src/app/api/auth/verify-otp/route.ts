import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limiter';
import { lookupIpLocation, parseUserAgent } from '@/lib/ip-lookup';

export const dynamic = 'force-dynamic';

const DB_TIMEOUT = Symbol('DB_TIMEOUT');
const DB_TIMEOUT_MS = 15000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | typeof DB_TIMEOUT> {
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<typeof DB_TIMEOUT>((resolve) => {
        timer = setTimeout(() => resolve(DB_TIMEOUT), ms);
      }),
    ]);
  } catch (err) {
    console.error(`[verify-otp] DB failed:`, err);
    return DB_TIMEOUT;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const USER_SELECT = {
  id: true,
  email: true,
  phone: true,
  name: true,
  nameEn: true,
  avatar: true,
  role: true,
  accountStatus: true,
  isActive: true,
  isVerified: true,
  phoneVerified: true,
  emailVerified: true,
  locale: true,
  createdAt: true,
  sellerProfile: { select: { id: true, storeName: true, storeNameEn: true } },
  logisticsProfile: { select: { id: true } },
  buyerProfile: { select: { id: true } },
  wallet: { select: { id: true, balance: true } },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, value, code } = body;

    if (!method || !value || !code) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    if (method !== 'phone' && method !== 'email' && method !== 'telegram') {
      return NextResponse.json({ success: false, message: 'Invalid method' }, { status: 400 });
    }

    const trimmedCode = code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      return NextResponse.json({ success: false, message: 'OTP must be 6 digits' }, { status: 400 });
    }

    const rateCheck = checkRateLimit(`otp-verify:${method}:${value}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, code: 'ERROR_TOO_MANY_ATTEMPTS', message: 'Too many attempts' }, { status: 429 });
    }

    await ensureDbConnection();

    // ── Verify OTP from Database ──
    const tokenRecord = await db.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: value,
          token: trimmedCode,
        }
      }
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, verified: false, code: 'ERROR_INVALID_OTP', message: `Invalid OTP.` },
        { status: 400 }
      );
    }

    if (tokenRecord.expires < new Date()) {
      return NextResponse.json(
        { success: false, verified: false, code: 'ERROR_OTP_EXPIRED', message: `OTP has expired.` },
        { status: 400 }
      );
    }


    // Update the most recent pending AuthLog
    const latestLog = await db.authLog.findFirst({
      where: { identifier: value, status: 'pending' },
      orderBy: { createdAt: 'desc' }
    });
    if (latestLog) {
      await db.authLog.update({
        where: { id: latestLog.id },
        data: { status: 'verified' }
      });
    }

    // OTP is valid. Delete it to prevent reuse.
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: value,
          token: trimmedCode,
        }
      }
    });

    // ── Find user in DB (with 15s timeout) ──
    let existingUser: Record<string, unknown> | null = null;
    try {
      const result = await withTimeout(
        db.user.findFirst({
          where: method === 'phone' || method === 'telegram' ? { phone: value } : { email: value },
          select: USER_SELECT,
        }),
        DB_TIMEOUT_MS
      );

      if (result !== DB_TIMEOUT) {
        existingUser = result;
      }
    } catch (e) {
      console.error('[verify-otp] DB unavailable:', e);
    }

    // ── SECURITY: If user found, verify contact matches ──
    if (existingUser) {
      const userPhone = existingUser.phone as string | null;
      const userEmail = existingUser.email as string | null;
      const contactMatch =
        ((method === 'phone' || method === 'telegram') && userPhone === value) ||
        (method === 'email' && userEmail === value);

      if (!contactMatch) {
        console.error('[verify-otp] SECURITY: User contact mismatch!', {
          submittedMethod: method,
          submittedValue: value,
          dbPhone: userPhone,
          dbEmail: userEmail,
        });
        return NextResponse.json({
          success: true,
          verified: true,
          isNewUser: true,
        });
      }

      // ── Create BetterAuth Session manually ──
      try {
        const crypto = require('crypto');
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
          
        const reqIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';
        const reqUserAgent = request.headers.get('user-agent') || '';
        
        // Try headers first for location
        let country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || '';
        let city = request.headers.get('cf-ipcity') || request.headers.get('x-vercel-ip-city') || '';
        
        if (city) {
          try { city = decodeURIComponent(city); } catch (e) {}
        }
        
        if (!country || !city) {
          const geo = await lookupIpLocation(reqIp);
          if (geo.countryCode && !country) country = geo.countryCode;
          if (geo.city && !city) city = geo.city;
        }
        
        const parsedUa = parseUserAgent(reqUserAgent);
        
        await db.session.create({
          data: {
            id: token, // Use token as ID or generate a new one
            userId: existingUser.id as string,
            token: token,
            expiresAt: expiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
            ipAddress: reqIp || null,
            userAgent: reqUserAgent || null,
            countryCode: country || null,
            city: city || null,
            deviceType: parsedUa.deviceType || null,
            os: parsedUa.os || null,
            browser: parsedUa.browser || null,
          }
        });
        
        const { cookies } = require('next/headers');
        const cookieStore = await cookies();
        const cookieName = process.env.NODE_ENV === 'production' 
          ? '__Secure-better-auth.session_token' 
          : 'better-auth.session_token';

        cookieStore.set(cookieName, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          expires: expiresAt,
          domain: process.env.NODE_ENV === 'production' ? '.chariday.com' : undefined,
        });
      } catch (sessionErr) {
        console.error('[verify-otp] Failed to create manual session:', sessionErr);
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      isNewUser: !existingUser,
      ...(existingUser && { user: existingUser }),
    });
  } catch (error) {
    console.error('[verify-otp] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
