import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// ============================================
// CRYPTO & TOTP UTILITIES
// ============================================

function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.toUpperCase().replace(/=+$/, '');
  const length = clean.length;
  let bits = 0;
  let value = 0;
  let index = 0;
  const buffer = Buffer.alloc(Math.floor((length * 5) / 8));

  for (let i = 0; i < length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      buffer[index++] = (value >> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return buffer;
}

export function verifyTOTP(token: string, secret: string, window = 1): boolean {
  try {
    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);

    for (let i = -window; i <= window; i++) {
      const c = counter + i;
      const buffer = Buffer.alloc(8);
      let temp = c;
      for (let j = 7; j >= 0; j--) {
        buffer[j] = temp & 0xff;
        temp = temp >> 8;
      }

      const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
      const offset = hmac[hmac.length - 1] & 0xf;
      const code =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

      const otp = (code % 1_000_000).toString().padStart(6, '0');
      if (otp === token.trim()) {
        return true;
      }
    }
  } catch (err) {
    console.error('verifyTOTP error:', err);
  }
  return false;
}

function generateBase32Secret(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = crypto.randomBytes(16); // 128 bits of entropy
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += alphabet[bytes[i] % 32];
  }
  return secret;
}

function hashRecoveryCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toLowerCase()).digest('hex');
}

// POST /api/auth/2fa
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, otpCode, recoveryCode } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Missing action parameter' }, { status: 400 });
    }

    // --------------------------------------------
    // ACTION: SETUP (Generate keys & recovery codes)
    // --------------------------------------------
    if (action === 'setup') {
      const secret = generateBase32Secret();
      const rawRecoveryCodes = Array.from({ length: 8 }, () =>
        crypto.randomBytes(5).toString('hex').toLowerCase()
      );
      const hashedCodes = rawRecoveryCodes.map(hashRecoveryCode);

      // Save to TwoFactor table (upsert if exists)
      await db.twoFactor.upsert({
        where: { id: session.user.id },
        update: {
          secret,
          backupCodes: JSON.stringify(hashedCodes)
        },
        create: {
          id: session.user.id,
          userId: session.user.id,
          secret,
          backupCodes: JSON.stringify(hashedCodes)
        }
      });

      const qrCodeUrl = `otpauth://totp/ChariDay:${session.user.email}?secret=${secret}&issuer=ChariDay`;

      return NextResponse.json({
        success: true,
        secret,
        qrCodeUrl,
        recoveryCodes: rawRecoveryCodes
      });
    }

    // --------------------------------------------
    // ACTION: ENABLE (Verify OTP & Turn ON 2FA)
    // --------------------------------------------
    if (action === 'enable') {
      if (!otpCode) {
        return NextResponse.json({ success: false, error: 'OTP code is required' }, { status: 400 });
      }

      const twoFactorRec = await db.twoFactor.findUnique({
        where: { id: session.user.id }
      });

      if (!twoFactorRec) {
        return NextResponse.json({ success: false, error: '2FA has not been setup yet' }, { status: 400 });
      }

      const verified = verifyTOTP(otpCode, twoFactorRec.secret);
      if (!verified) {
        return NextResponse.json({ success: false, error: 'رمز التحقق غير صحيح أو منتهي الصلاحية.' }, { status: 400 });
      }

      // Update user
      await db.user.update({
        where: { id: session.user.id },
        data: { twoFactorEnabled: true }
      });

      // Log AuditLog
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: '2fa_enabled',
          details: JSON.stringify({ ip: req.headers.get('x-forwarded-for') || '127.0.0.1' })
        }
      });

      return NextResponse.json({ success: true, message: 'تم تفعيل المصادقة الثنائية لحسابك بنجاح.' });
    }

    // --------------------------------------------
    // ACTION: DISABLE (Turn OFF 2FA)
    // --------------------------------------------
    if (action === 'disable') {
      const twoFactorRec = await db.twoFactor.findUnique({
        where: { id: session.user.id }
      });

      if (!twoFactorRec) {
        return NextResponse.json({ success: false, error: '2FA is not enabled' }, { status: 400 });
      }

      let isAllowed = false;

      if (otpCode) {
        isAllowed = verifyTOTP(otpCode, twoFactorRec.secret);
        if (!isAllowed) {
          return NextResponse.json({ success: false, error: 'رمز التحقق غير صحيح.' }, { status: 400 });
        }
      } else if (recoveryCode) {
        const hashedInput = hashRecoveryCode(recoveryCode);
        const savedCodes: string[] = JSON.parse(twoFactorRec.backupCodes);
        const index = savedCodes.indexOf(hashedInput);

        if (index !== -1) {
          isAllowed = true;
          // Consume the recovery code
          savedCodes.splice(index, 1);
          await db.twoFactor.update({
            where: { id: session.user.id },
            data: { backupCodes: JSON.stringify(savedCodes) }
          });
        } else {
          return NextResponse.json({ success: false, error: 'رمز الاستعادة الاحتياطي غير صحيح.' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ success: false, error: 'يرجى إدخال رمز التحقق أو رمز الاستعادة.' }, { status: 400 });
      }

      if (isAllowed) {
        await db.user.update({
          where: { id: session.user.id },
          data: { twoFactorEnabled: false }
        });

        await db.twoFactor.delete({
          where: { id: session.user.id }
        }).catch(() => {});

        // Log AuditLog
        await db.auditLog.create({
          data: {
            userId: session.user.id,
            action: '2fa_disabled',
            details: JSON.stringify({ ip: req.headers.get('x-forwarded-for') || '127.0.0.1' })
          }
        });

        return NextResponse.json({ success: true, message: 'تم إيقاف المصادقة الثنائية لحسابك بنجاح.' });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[2FA POST] Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
