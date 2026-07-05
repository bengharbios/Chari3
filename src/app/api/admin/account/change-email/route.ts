import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// In-memory OTP store (in production use Redis)
// Key: `${adminId}:${type}`, Value: { code, expires, targetEmail? }
const otpStore = new Map<string, { code: string; expires: number; targetEmail?: string }>();

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ============================================
// POST /api/admin/account/change-email
// Step 1: Initiate (sends OTP to current + new email)
// Step 2: Confirm (verifies both OTPs and changes email)
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminId, step, newEmail, password, currentOtp, newOtp } = body;

    if (!adminId) {
      return NextResponse.json({ success: false, error: 'adminId required' }, { status: 400 });
    }

    const admin = await db.user.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    // ── STEP 1: Initiate email change ──
    if (step === 'initiate') {
      if (!newEmail || !password) {
        return NextResponse.json({ success: false, error: 'newEmail and password are required' }, { status: 400 });
      }

      // Check email not already used
      const existingUser = await db.user.findUnique({ where: { email: newEmail } });
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'هذا البريد الإلكتروني مستخدم بالفعل',
            errorEn: 'This email is already in use',
          },
          { status: 409 }
        );
      }

      // Verify current password
      const isValid = await bcrypt.compare(password, admin.password || '');
      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'كلمة السر غير صحيحة',
            errorEn: 'Incorrect password',
          },
          { status: 401 }
        );
      }

      // Generate OTPs
      const currentEmailOtp = generateOtp();
      const newEmailOtp = generateOtp();
      const expires = Date.now() + 15 * 60 * 1000; // 15 min

      otpStore.set(`${adminId}:current`, { code: currentEmailOtp, expires });
      otpStore.set(`${adminId}:new`, { code: newEmailOtp, expires, targetEmail: newEmail });

      // In production: send emails via SMTP
      // For now: log and return (dev mode)
      console.log(`[Admin Email Change] OTP for current email (${admin.email}): ${currentEmailOtp}`);
      console.log(`[Admin Email Change] OTP for new email (${newEmail}): ${newEmailOtp}`);

      // Try to send via admin settings SMTP
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/settings/send-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: admin.email,
            subject: 'طلب تغيير البريد الإلكتروني — ChariDay Admin',
            body: `رمز التحقق الخاص بك: ${currentEmailOtp} (صالح 15 دقيقة)`,
          }),
        });
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/settings/send-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: newEmail,
            subject: 'تأكيد البريد الإلكتروني الجديد — ChariDay Admin',
            body: `رمز تأكيد البريد الجديد: ${newEmailOtp} (صالح 15 دقيقة)`,
          }),
        });
      } catch {
        // Non-critical — OTPs still stored
      }

      return NextResponse.json({
        success: true,
        message: 'تم إرسال رمزي التحقق إلى بريدك الحالي والجديد',
        messageEn: 'Verification codes sent to your current and new email',
        // DEV ONLY — remove in production:
        devCurrentOtp: process.env.NODE_ENV === 'development' ? currentEmailOtp : undefined,
        devNewOtp: process.env.NODE_ENV === 'development' ? newEmailOtp : undefined,
      });
    }

    // ── STEP 2: Confirm email change ──
    if (step === 'confirm') {
      if (!currentOtp || !newOtp) {
        return NextResponse.json({ success: false, error: 'Both OTP codes are required' }, { status: 400 });
      }

      const currentEntry = otpStore.get(`${adminId}:current`);
      const newEntry = otpStore.get(`${adminId}:new`);

      if (!currentEntry || !newEntry) {
        return NextResponse.json(
          {
            success: false,
            error: 'انتهت صلاحية رموز التحقق. يرجى البدء من جديد.',
            errorEn: 'Verification codes expired. Please start over.',
          },
          { status: 400 }
        );
      }

      if (Date.now() > currentEntry.expires || Date.now() > newEntry.expires) {
        otpStore.delete(`${adminId}:current`);
        otpStore.delete(`${adminId}:new`);
        return NextResponse.json(
          {
            success: false,
            error: 'انتهت صلاحية الرموز (15 دقيقة). يرجى البدء من جديد.',
            errorEn: 'Codes expired (15 minutes). Please start over.',
          },
          { status: 400 }
        );
      }

      if (currentEntry.code !== currentOtp.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: 'رمز التحقق للبريد الحالي غير صحيح',
            errorEn: 'Current email verification code is incorrect',
          },
          { status: 401 }
        );
      }

      if (newEntry.code !== newOtp.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: 'رمز تأكيد البريد الجديد غير صحيح',
            errorEn: 'New email confirmation code is incorrect',
          },
          { status: 401 }
        );
      }

      const targetEmail = newEntry.targetEmail!;

      // Change email
      await db.user.update({
        where: { id: adminId },
        data: { email: targetEmail, emailVerified: true },
      });

      // Clean up OTPs
      otpStore.delete(`${adminId}:current`);
      otpStore.delete(`${adminId}:new`);

      // Audit log
      await db.auditLog.create({
        data: {
          userId: adminId,
          adminId,
          action: 'admin_email_change',
          details: JSON.stringify({
            oldEmail: admin.email,
            newEmail: targetEmail,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'تم تغيير البريد الإلكتروني بنجاح',
        messageEn: 'Email changed successfully',
        newEmail: targetEmail,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid step' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/admin/account/change-email]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
