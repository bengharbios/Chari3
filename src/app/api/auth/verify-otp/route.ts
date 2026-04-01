import { NextResponse } from 'next/server';

const DEMO_CODE = '123456';
const DB_TIMEOUT = Symbol('DB_TIMEOUT');
const DB_TIMEOUT_MS = 15000;

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

// Fields to select when returning an existing user
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

    // ── Validate required fields ──
    if (!method || !value || !code) {
      return NextResponse.json(
        { success: false, message: 'Missing fields' },
        { status: 400 }
      );
    }

    if (method !== 'phone' && method !== 'email') {
      return NextResponse.json(
        { success: false, message: 'Invalid method' },
        { status: 400 }
      );
    }

    // ── Validate OTP format (6 digits) ──
    const trimmedCode = code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      return NextResponse.json(
        { success: false, message: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    // ── DEMO CODE (always works) ──
    if (trimmedCode === DEMO_CODE) {
      console.log(`[verify-otp] Demo code used for ${method}:${value}`);

      let existingUser: Record<string, unknown> | null = null;

      try {
        const { db } = await import('@/lib/db');
        const result = await withTimeout(
          db.user.findFirst({
            where: method === 'phone' ? { phone: value } : { email: value },
            select: USER_SELECT,
          }),
          DB_TIMEOUT_MS
        );

        if (result !== DB_TIMEOUT) {
          existingUser = result;
        } else {
          console.log('[verify-otp] DB timeout on demo code path, treating as new user');
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

    // ── Validate contact format ──
    if (method === 'phone') {
      const cleaned = value.replace(/[\s\-()]/g, '');
      if (!/^\+?\d{8,15}$/.test(cleaned) && !/^00\d{9,14}$/.test(cleaned)) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone' },
          { status: 400 }
        );
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email' },
          { status: 400 }
        );
      }
    }

    // ── Rate limit ──
    const { checkRateLimit } = await import('@/lib/rate-limiter');
    const rateCheck = checkRateLimit(`otp-verify:${method}:${value}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts' },
        { status: 429 }
      );
    }

    // ── Verify OTP via in-memory store ──
    const { verifyOTP, getRemainingAttempts, MAX_ATTEMPTS } = await import('@/lib/otp-store');
    if (!verifyOTP(value, trimmedCode, method)) {
      const attemptsLeft = getRemainingAttempts(value, method);
      if (attemptsLeft === 0) {
        return NextResponse.json(
          { success: false, message: `Max attempts (${MAX_ATTEMPTS})` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, verified: false, message: `Invalid OTP. ${attemptsLeft} remaining.` },
        { status: 400 }
      );
    }

    // ── Find user in DB (with 15s timeout) ──
    let existingUser: Record<string, unknown> | null = null;
    try {
      const { db } = await import('@/lib/db');
      const result = await withTimeout(
        db.user.findFirst({
          where: method === 'phone' ? { phone: value } : { email: value },
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
        (method === 'phone' && userPhone === value) ||
        (method === 'email' && userEmail === value);

      if (!contactMatch) {
        console.error('[verify-otp] SECURITY: User contact mismatch!', {
          submittedMethod: method,
          submittedValue: value,
          dbPhone: userPhone,
          dbEmail: userEmail,
        });
        // Don't return the user — treat as new user
        return NextResponse.json({
          success: true,
          verified: true,
          isNewUser: true,
        });
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
