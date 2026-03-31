import { NextResponse } from 'next/server';

const DEMO_CODE = '123456';
const DB_TIMEOUT = Symbol('DB_TIMEOUT');

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | typeof DB_TIMEOUT> {
  let timer: ReturnType<typeof setTimeout>;
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
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, value, code } = body;

    if (!method || !value || !code) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }
    if (method !== 'phone' && method !== 'email') {
      return NextResponse.json({ success: false, message: 'Invalid method' }, { status: 400 });
    }

    // ── DEMO CODE ──
    if (code.trim() === DEMO_CODE) {
      console.log(`[verify-otp] Demo code for ${method}:${value}`);

      let existingUser: Record<string, unknown> | null = null;

      try {
        const { db } = await import('@/lib/db');
        const result = await withTimeout(
          db.user.findFirst({
            where: method === 'phone' ? { phone: value } : { email: value },
            select: {
              id: true, email: true, phone: true, name: true, nameEn: true,
              avatar: true, role: true, accountStatus: true, isActive: true,
              isVerified: true, phoneVerified: true, emailVerified: true,
              locale: true, createdAt: true,
            },
          }),
          15000
        );

        if (result !== DB_TIMEOUT) {
          existingUser = result; // null = no user, object = user found
        } else {
          console.log('[verify-otp] DB timeout, treating as new user');
        }
      } catch (e) {
        console.error('[verify-otp] DB unavailable:', e);
      }

      return NextResponse.json({
        success: true,
        verified: true,
        isNewUser: !existingUser,
        ...(existingUser && { user: existingUser }),
      });
    }

    // ── Validate OTP format ──
    if (!/^\d{6}$/.test(code.trim())) {
      return NextResponse.json({ success: false, message: 'OTP must be 6 digits' }, { status: 400 });
    }
    if (method === 'phone') {
      const cleaned = value.replace(/[\s\-()]/g, '');
      if (!/^\+?\d{8,15}$/.test(cleaned) && !/^00\d{9,14}$/.test(cleaned)) {
        return NextResponse.json({ success: false, message: 'Invalid phone' }, { status: 400 });
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 });
      }
    }

    // ── Rate limit ──
    const { checkRateLimit } = await import('@/lib/rate-limiter');
    const rateCheck = checkRateLimit(`otp-verify:${method}:${value}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, message: 'Too many attempts' }, { status: 429 });
    }

    // ── Verify OTP via store ──
    const { verifyOTP, getRemainingAttempts, MAX_ATTEMPTS } = await import('@/lib/otp-store');
    if (!verifyOTP(value, code.trim(), method)) {
      const attemptsLeft = getRemainingAttempts(value, method);
      if (attemptsLeft === 0) {
        return NextResponse.json({ success: false, message: `Max attempts (${MAX_ATTEMPTS})` }, { status: 400 });
      }
      return NextResponse.json({ success: false, verified: false, message: `Invalid OTP. ${attemptsLeft} remaining.` }, { status: 400 });
    }

    // ── Find user in DB ──
    let existingUser: Record<string, unknown> | null = null;
    try {
      const { db } = await import('@/lib/db');
      const result = await withTimeout(
        db.user.findFirst({
          where: method === 'phone' ? { phone: value } : { email: value },
          select: {
            id: true, email: true, phone: true, name: true, nameEn: true,
            avatar: true, role: true, accountStatus: true, isActive: true,
            isVerified: true, phoneVerified: true, emailVerified: true,
            locale: true, createdAt: true,
          },
        }),
        15000
      );
      if (result !== DB_TIMEOUT) {
        existingUser = result;
      }
    } catch (e) {
      console.error('[verify-otp] DB unavailable:', e);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      isNewUser: !existingUser,
      ...(existingUser && { user: existingUser }),
    });
  } catch (error) {
    console.error('[verify-otp] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
