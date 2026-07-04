import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await req.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Fetch user with current password hash
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, forcePasswordChange: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json({ success: false, error: 'No password set for this account (OAuth user)' }, { status: 400 });
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return NextResponse.json({ success: false, error: 'كلمة المرور الحالية غير صحيحة / Current password is incorrect' }, { status: 401 });
    }

    // Ensure new password differs from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json({ success: false, error: 'New password must be different from the current password' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user: clear forcePasswordChange flag and set new password
    await db.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        forcePasswordChange: false,
      },
    });

    // Log audit event
    await db.auditLog.create({
      data: {
        userId,
        action: 'forced_password_changed',
        targetId: userId,
        targetType: 'user',
        details: 'User changed their forced-reset password successfully.',
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[force-change-password POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
