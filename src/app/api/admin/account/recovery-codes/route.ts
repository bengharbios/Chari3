import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const RECOVERY_CODES_COUNT = 10;

function generateRecoveryCodes(): string[] {
  return Array.from({ length: RECOVERY_CODES_COUNT }, () => {
    // Format: XXXX-XXXX-XXXX (12 hex chars in groups of 4)
    const part = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${part()}-${part()}-${part()}`;
  });
}

// ============================================
// GET /api/admin/account/recovery-codes?adminId=xxx
// Returns count of remaining codes (NOT the codes themselves)
// ============================================
export async function GET(req: NextRequest) {
  try {
    const adminId = req.nextUrl.searchParams.get('adminId');
    if (!adminId) return NextResponse.json({ success: false, error: 'adminId required' }, { status: 400 });

    const twoFactorRecord = await db.twoFactor.findUnique({
      where: { userId: adminId },
      select: { backupCodes: true },
    });

    if (!twoFactorRecord) {
      return NextResponse.json({ success: true, hasRecoveryCodes: false, remaining: 0 });
    }

    let remaining = 0;
    try {
      const codes: string[] = JSON.parse(twoFactorRecord.backupCodes || '[]');
      remaining = codes.length;
    } catch {
      remaining = 0;
    }

    return NextResponse.json({ success: true, hasRecoveryCodes: remaining > 0, remaining });
  } catch (err) {
    console.error('[GET /api/admin/account/recovery-codes]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// ============================================
// POST /api/admin/account/recovery-codes
// Generates new recovery codes (invalidates old ones)
// Body: { adminId, password, totpCode? }
// Returns the new codes ONCE — user must save them
// ============================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminId, password, totpCode } = body;

    if (!adminId || !password) {
      return NextResponse.json({ success: false, error: 'adminId and password required' }, { status: 400 });
    }

    const admin = await db.user.findUnique({
      where: { id: adminId },
      select: { id: true, password: true, twoFactorEnabled: true },
    });

    if (!admin) return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password || '');
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'كلمة السر غير صحيحة', errorEn: 'Incorrect password' },
        { status: 401 }
      );
    }

    // If 2FA enabled, require TOTP
    if (admin.twoFactorEnabled) {
      if (!totpCode) {
        return NextResponse.json(
          { success: false, error: 'رمز التحقق الثنائي مطلوب', errorEn: '2FA code required', requires2FA: true },
          { status: 400 }
        );
      }

      const twoFactorRecord = await db.twoFactor.findUnique({ where: { userId: adminId } });
      if (!twoFactorRecord) {
        return NextResponse.json({ success: false, error: '2FA not configured' }, { status: 400 });
      }

      // Verify TOTP
      const { authenticator } = await import('otplib');
      const valid = authenticator.verify({ token: totpCode, secret: twoFactorRecord.secret });
      if (!valid) {
        return NextResponse.json(
          { success: false, error: 'رمز TOTP غير صحيح', errorEn: 'Invalid TOTP code' },
          { status: 401 }
        );
      }
    }

    // Generate new codes
    const newCodes = generateRecoveryCodes();

    // Hash codes before storing (store hashed, return plaintext once)
    const hashedCodes = await Promise.all(newCodes.map(code => bcrypt.hash(code, 10)));

    // Save to DB (upsert twoFactor record)
    await db.twoFactor.upsert({
      where: { userId: adminId },
      update: { backupCodes: JSON.stringify(hashedCodes) },
      create: {
        userId: adminId,
        secret: '',
        backupCodes: JSON.stringify(hashedCodes),
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        adminId,
        action: 'admin_recovery_codes_regenerated',
        details: JSON.stringify({ count: RECOVERY_CODES_COUNT, timestamp: new Date().toISOString() }),
      },
    });

    return NextResponse.json({
      success: true,
      codes: newCodes, // ⚠️ Shown ONCE — user must save these
      count: RECOVERY_CODES_COUNT,
      message: 'احفظ هذه الرموز في مكان آمن. لن تظهر مجدداً.',
      messageEn: 'Save these codes in a safe place. They will not be shown again.',
    });
  } catch (err) {
    console.error('[POST /api/admin/account/recovery-codes]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
