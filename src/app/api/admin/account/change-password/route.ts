import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';

export const dynamic = 'force-dynamic';

// ============================================
// POST /api/admin/account/change-password
// Body: { adminId, currentPassword, newPassword, totpCode? }
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminId, currentPassword, newPassword, totpCode } = body;

    if (!adminId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'adminId, currentPassword, and newPassword are required' },
        { status: 400 }
      );
    }

    // Password strength: min 12 chars, uppercase, lowercase, number, special char
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{12,}$/;
    if (!strongPassword.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: 'كلمة السر يجب أن تحتوي على 12 حرفاً على الأقل، حرف كبير وصغير ورقم ورمز خاص',
          errorEn: 'Password must be at least 12 characters with uppercase, lowercase, number, and special character',
        },
        { status: 400 }
      );
    }

    // Fetch admin user
    const admin = await db.user.findUnique({
      where: { id: adminId },
      select: { id: true, password: true, twoFactorEnabled: true, role: true },
    });

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, admin.password || '');
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'كلمة السر الحالية غير صحيحة',
          errorEn: 'Current password is incorrect',
        },
        { status: 401 }
      );
    }

    // If 2FA is enabled, require TOTP
    if (admin.twoFactorEnabled) {
      if (!totpCode) {
        return NextResponse.json(
          {
            success: false,
            error: 'يجب إدخال رمز المصادقة الثنائية (TOTP)',
            errorEn: 'Two-factor authentication code is required',
            requires2FA: true,
          },
          { status: 400 }
        );
      }

      const twoFactorRecord = await db.twoFactor.findUnique({ where: { userId: adminId } });
      if (!twoFactorRecord) {
        return NextResponse.json({ success: false, error: '2FA record not found' }, { status: 404 });
      }

      const isValidTotp = authenticator.verify({
        token: totpCode,
        secret: twoFactorRecord.secret,
      });

      if (!isValidTotp) {
        return NextResponse.json(
          {
            success: false,
            error: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
            errorEn: 'Invalid or expired authentication code',
          },
          { status: 401 }
        );
      }
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.user.update({
      where: { id: adminId },
      data: { password: hashed },
    });

    // Log the action
    await db.auditLog.create({
      data: {
        userId: adminId,
        adminId,
        action: 'admin_password_change',
        details: JSON.stringify({
          performedBy: adminId,
          method: admin.twoFactorEnabled ? 'password+totp' : 'password',
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // Revoke all other sessions for security
    try {
      await db.session.deleteMany({
        where: { userId: adminId },
      });
    } catch {
      // sessions table might have different name — non-critical
    }

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة السر بنجاح. يرجى تسجيل الدخول مجدداً.',
      messageEn: 'Password changed successfully. Please log in again.',
    });
  } catch (err) {
    console.error('[POST /api/admin/account/change-password]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
