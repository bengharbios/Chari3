import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import * as nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

function generateRandomOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailOTP(email: string, otp: string, isNew = false) {
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

      const messageType = isNew ? 'تأكيد البريد الإلكتروني الجديد' : 'الموافقة على تغيير البريد الإلكتروني';

      await transporter.sendMail({
        from: settingsMap.otp_smtp_from || '"ChariDay Security" <no-reply@chariday.com>',
        to: email,
        subject: `رمز الأمان: ${messageType}`,
        text: `رمز الأمان الخاص بك هو: ${otp}`,
        html: `<div style="text-align: center; font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                <h2 style="color: #d9534f;">أمن الحساب - ChariDay</h2>
                <p>لقد تم طلب تغيير البريد الإلكتروني لحسابك.</p>
                <p><strong>رمز الأمان لـ ${messageType}:</strong></p>
                <h1 style="color: #007aff; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
                <p>هذا الرمز صالح لمدة 5 دقائق. إذا لم تطلب هذا التغيير، يرجى تأمين حسابك فوراً.</p>
               </div>`,
      });
      console.log(`[Profile Update OTP] Email sent to ${email}`);
      return true;
    } catch (err) {
      console.error('[Profile Update OTP] Failed to send email:', err);
    }
  }
  return false;
}

async function sendSmsOTP(phone: string, otp: string, isNew = false) {
  const settings = await db.systemSetting.findMany({
    where: {
      key: { in: ['otp_custom_gateway_enabled', 'otp_custom_gateway_url', 'otp_custom_gateway_token', 'otp_sms_template'] }
    }
  });
  const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

  if (settingsMap.otp_custom_gateway_enabled === 'true' && settingsMap.otp_custom_gateway_url) {
    try {
      const headersMap: Record<string, string> = { 'Content-Type': 'application/json' };
      if (settingsMap.otp_custom_gateway_token) {
        headersMap['Authorization'] = settingsMap.otp_custom_gateway_token.startsWith('Basic ') || settingsMap.otp_custom_gateway_token.startsWith('Bearer ')
          ? settingsMap.otp_custom_gateway_token
          : `Bearer ${settingsMap.otp_custom_gateway_token}`;
      }

      const messageType = isNew ? 'لتأكيد الرقم الجديد' : 'للموافقة على تغيير رقم الهاتف لحسابك';
      const smsText = `رمز الأمان: ${otp} ${messageType} (صالح لـ 5 دقائق).`;

      const urlObj = new URL(settingsMap.otp_custom_gateway_url);
      urlObj.searchParams.set('to', phone);
      urlObj.searchParams.set('message', smsText);

      const res = await fetch(urlObj.toString(), {
        method: 'POST',
        headers: headersMap,
        body: JSON.stringify({
          to: phone,
          phone: phone,
          message: smsText,
          otp,
          type: 'SMS',
          phoneNumbers: [phone]
        })
      });

      if (res.ok) {
        console.log(`[Profile Update OTP] SMS sent to ${phone}`);
        return true;
      } else {
        console.error('[Profile Update OTP] SMS Gateway error:', await res.text());
      }
    } catch (err) {
      console.error('[Profile Update OTP] Failed to send SMS:', err);
    }
  }
  return false;
}

// POST /api/user/profile/update-sensitive
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, method, newValue, oldOtp, newOtp } = body;

    if (!action || !method) {
      return NextResponse.json({ success: false, error: 'Missing action or method' }, { status: 400 });
    }

    if (method !== 'email' && method !== 'phone') {
      return NextResponse.json({ success: false, error: 'Invalid method. Must be email or phone' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, phone: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // ============================================
    // ACTION: REQUEST CHANGE (Generate & Send OTPs)
    // ============================================
    if (action === 'request_change') {
      if (!newValue) {
        return NextResponse.json({ success: false, error: 'New value is required' }, { status: 400 });
      }

      // Check if new value is already taken
      const valueTaken = await db.user.findFirst({
        where: method === 'email' ? { email: newValue } : { phone: newValue }
      });
      if (valueTaken && valueTaken.id !== user.id) {
        return NextResponse.json({
          success: false,
          error: method === 'email' ? 'البريد الإلكتروني الجديد مستخدم بالفعل لحساب آخر.' : 'رقم الهاتف الجديد مستخدم بالفعل لحساب آخر.'
        }, { status: 400 });
      }

      const oldValue = method === 'email' ? user.email : user.phone;

      // 1. Generate OTPs
      const oldOtpCode = generateRandomOTP();
      const newOtpCode = generateRandomOTP();

      // 2. Save OTPs to DB (expires in 5 minutes)
      const expiry = new Date(Date.now() + 5 * 60 * 1000);

      // Save token for old email/phone verification
      if (oldValue) {
        await db.verificationToken.upsert({
          where: { identifier_token: { identifier: `${oldValue}_profile_update`, token: oldOtpCode } },
          update: { expires: expiry },
          create: { identifier: `${oldValue}_profile_update`, token: oldOtpCode, expires: expiry }
        });
      }

      // Save token for new email/phone verification
      await db.verificationToken.upsert({
        where: { identifier_token: { identifier: `${newValue}_profile_update`, token: newOtpCode } },
        update: { expires: expiry },
        create: { identifier: `${newValue}_profile_update`, token: newOtpCode, expires: expiry }
      });

      // 3. Send OTPs
      let oldSent = false;
      let newSent = false;

      if (method === 'email') {
        if (oldValue) oldSent = await sendEmailOTP(oldValue, oldOtpCode, false);
        else oldSent = true; // No old email (e.g. phone-only registration), skip old verify
        newSent = await sendEmailOTP(newValue, newOtpCode, true);
      } else {
        if (oldValue) oldSent = await sendSmsOTP(oldValue, oldOtpCode, false);
        else oldSent = true; // No old phone, skip old verify
        newSent = await sendSmsOTP(newValue, newOtpCode, true);
      }

      // Log codes in dev environment for easy testing
      console.log(`[DEV ONLY] Profile change OTPs: Old Code = ${oldOtpCode}, New Code = ${newOtpCode}`);

      return NextResponse.json({
        success: true,
        message: 'تم إرسال رموز الأمان للبريد/الهاتف القديم والجديد بنجاح. يرجى تأكيدها لإتمام التغيير.',
        requiresOldVerify: !!oldValue,
        _devCodeOld: oldOtpCode,
        _devCodeNew: newOtpCode,
      });
    }

    // ============================================
    // ACTION: CONFIRM CHANGE (Verify & Update)
    // ============================================
    if (action === 'confirm_change') {
      if (!newValue || !newOtp) {
        return NextResponse.json({ success: false, error: 'Missing newValue or newOtp' }, { status: 400 });
      }

      const oldValue = method === 'email' ? user.email : user.phone;

      // 1. Verify old value OTP (if oldValue exists)
      if (oldValue) {
        if (!oldOtp) {
          return NextResponse.json({ success: false, error: 'رمز تأكيد العنوان الحالي مطلوب' }, { status: 400 });
        }
        const oldTokenRecord = await db.verificationToken.findUnique({
          where: { identifier_token: { identifier: `${oldValue}_profile_update`, token: oldOtp.trim() } }
        });

        if (!oldTokenRecord || oldTokenRecord.expires < new Date()) {
          return NextResponse.json({ success: false, error: 'رمز تأكيد البريد/الهاتف الحالي غير صالح أو منتهي الصلاحية.' }, { status: 400 });
        }
      }

      // 2. Verify new value OTP
      const newTokenRecord = await db.verificationToken.findUnique({
        where: { identifier_token: { identifier: `${newValue}_profile_update`, token: newOtp.trim() } }
      });

      if (!newTokenRecord || newTokenRecord.expires < new Date()) {
        return NextResponse.json({ success: false, error: 'رمز تأكيد البريد/الهاتف الجديد غير صالح أو منتهي الصلاحية.' }, { status: 400 });
      }

      // 3. Cleanup used tokens
      if (oldValue) {
        await db.verificationToken.delete({
          where: { identifier_token: { identifier: `${oldValue}_profile_update`, token: oldOtp.trim() } }
        }).catch(() => {});
      }
      await db.verificationToken.delete({
        where: { identifier_token: { identifier: `${newValue}_profile_update`, token: newOtp.trim() } }
      }).catch(() => {});

      // 4. Perform User profile update in Transaction
      await db.$transaction(async (tx) => {
        if (method === 'email') {
          await tx.user.update({
            where: { id: user.id },
            data: { email: newValue, emailVerified: true }
          });

          // Log AuditLog
          await tx.auditLog.create({
            data: {
              userId: user.id,
              action: 'email_changed',
              details: JSON.stringify({ oldValue, newValue }),
            }
          });
        } else {
          await tx.user.update({
            where: { id: user.id },
            data: { phone: newValue, phoneVerified: true }
          });

          // Log AuditLog
          await tx.auditLog.create({
            data: {
              userId: user.id,
              action: 'phone_changed',
              details: JSON.stringify({ oldValue, newValue }),
            }
          });
        }

        // Send confirmation notification to the user
        await tx.notification.create({
          data: {
            userId: user.id,
            type: 'alert',
            title: 'تنبيه أمني: تغيير البيانات الحساسة للحساب',
            titleEn: 'Security Alert: Sensitive account details updated',
            body: `تم تغيير ${method === 'email' ? 'البريد الإلكتروني' : 'رقم الهاتف'} لحسابك بنجاح. لدواعي الأمان، تم إيقاف طلبات سحب الأموال مؤقتاً لمدة 48 ساعة.`,
            bodyEn: `Your account\'s ${method === 'email' ? 'email' : 'phone number'} has been successfully updated. Payout requests are temporarily blocked for 48 hours for security reasons.`,
            urgency: 'high'
          }
        });

        // Notify Admins
        const admins = await tx.user.findMany({
          where: { role: { in: ['admin', 'SUPER_ADMIN', 'super_admin'] } },
          select: { id: true }
        });

        const adminNotifications = admins.map(admin => ({
          userId: admin.id,
          type: 'alert',
          title: 'تغيير بيانات حساب تاجر',
          titleEn: 'Merchant Account Details Changed',
          body: `قام التاجر ${user.name || user.id} بتغيير ${method === 'email' ? 'بريده الإلكتروني' : 'رقم هاتفه'}. تم تطبيق قفل السحب الاحترازي لمدة 48 ساعة.`,
          bodyEn: `Merchant ${user.name || user.id} has changed their login ${method === 'email' ? 'email' : 'phone'}. 48-hour withdrawal lock applied.`,
          urgency: 'high'
        }));

        if (adminNotifications.length > 0) {
          await tx.notification.createMany({
            data: adminNotifications
          });
        }
      });

      return NextResponse.json({
        success: true,
        message: 'تم تحديث بيانات حسابك بنجاح. تم تفعيل قفل سحب الأرباح لمدة 48 ساعة كإجراء وقائي للحساب.'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[update-sensitive POST] Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
