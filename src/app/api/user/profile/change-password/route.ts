import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';

// Password strength requirements (2026 standards):
// - Minimum 8 characters
// - At least 1 uppercase letter
// - At least 1 lowercase letter
// - At least 1 digit
// - At least 1 special character
// - Not identical to old password
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/;

function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      message:
        'Password must contain: uppercase letter, lowercase letter, number, and special character (!@#$%^&* etc.)',
    };
  }
  return { valid: true, message: '' };
}

// POST /api/user/profile/change-password
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // ── 1. Validate inputs ───────────────────────────────────────────────────
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    // ── 2. Password strength check ───────────────────────────────────────────
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return NextResponse.json(
        { success: false, error: strengthCheck.message },
        { status: 400 }
      );
    }

    // ── 3. Fetch user's current password hash ────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Get the stored password from better-auth Account table
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: 'credential',
      },
      select: { password: true },
    });

    if (!account?.password) {
      return NextResponse.json(
        { success: false, error: 'No password set on this account. Use social login.' },
        { status: 400 }
      );
    }

    // ── 4. Verify old password ───────────────────────────────────────────────
    const isOldPasswordCorrect = await bcrypt.compare(currentPassword, account.password);
    if (!isOldPasswordCorrect) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // ── 5. Prevent same-as-old password ─────────────────────────────────────
    const isSameAsOld = await bcrypt.compare(newPassword, account.password);
    if (isSameAsOld) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from your current password' },
        { status: 400 }
      );
    }

    // ── 6. Hash & save new password ──────────────────────────────────────────
    const hashedNewPassword = await bcrypt.hash(newPassword, 12); // cost factor 12

    await prisma.account.update({
      where: {
        providerId_accountId: {
          providerId: 'credential',
          accountId: user.email,
        },
      },
      data: { password: hashedNewPassword },
    });

    // ── 7. Revoke all sessions except current (security best practice) ───────
    const currentSessionToken = req.headers.get('x-session-token') || '';
    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        ...(currentSessionToken ? { token: { not: currentSessionToken } } : {}),
      },
    });

    // ── 8. AuditLog ──────────────────────────────────────────────────────────
    const ipAddress =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0';

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'password_changed',
        ipAddress,
        details: { method: 'user_self_service' },
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. All other sessions have been terminated.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
