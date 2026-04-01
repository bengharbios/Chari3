import { NextResponse } from 'next/server';
import { validatePhone, validateEmail, validateFullName, validateRole, sanitizeInput } from '@/lib/validators';
import { randomUUID } from 'crypto';

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
    console.error(`[DB] Query failed:`, err);
    return DB_TIMEOUT;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, value, fullName, role, storeName, locale } = body;

    if (!method || !value || !fullName || !role) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }
    if (method !== 'phone' && method !== 'email') {
      return NextResponse.json({ success: false, message: 'Invalid method' }, { status: 400 });
    }
    if (!validateFullName(fullName)) {
      return NextResponse.json({ success: false, message: 'Invalid name' }, { status: 400 });
    }
    if (!validateRole(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }
    if (method === 'phone' && !validatePhone(value)) {
      return NextResponse.json({ success: false, message: 'Invalid phone' }, { status: 400 });
    }
    if (method === 'email' && !validateEmail(value)) {
      return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 });
    }

    const sanitizedName = sanitizeInput(fullName);
    const sanitizedStoreName = storeName ? sanitizeInput(storeName) : undefined;
    const accountStatus = role === 'buyer' ? 'active' : 'incomplete';
    const userId = randomUUID();
    const now = new Date().toISOString();

    // ── Try DB operations (best-effort) ──
    let dbUser: Record<string, unknown> | null = null;
    let dbAvailable = false;

    try {
      const { db } = await import('@/lib/db');
      dbAvailable = true;

      // Check if user exists
      const existing = await withTimeout(
        db.user.findFirst({
          where: method === 'phone' ? { phone: value } : { email: value },
          select: {
            id: true, email: true, phone: true, name: true, nameEn: true,
            avatar: true, role: true, accountStatus: true, isActive: true,
            isVerified: true, phoneVerified: true, emailVerified: true,
            locale: true, createdAt: true,
            sellerProfile: { select: { id: true, storeName: true } },
            logisticsProfile: { select: { id: true } },
            buyerProfile: { select: { id: true } },
            wallet: { select: { id: true, balance: true } },
          },
        }),
        15000
      );

      if (existing !== DB_TIMEOUT && existing) {
        // User exists in DB → return them
        console.log(`[register] Existing user: ${existing.id} (${existing.name})`);
        return NextResponse.json({ success: true, alreadyExists: true, user: existing });
      }

      // Create user in DB
      const defaultEmail = method === 'phone'
        ? `user_${value.replace(/\D/g, '')}@charyday.local`
        : value;

      const created = await withTimeout(
        db.user.create({
          data: {
            email: defaultEmail,
            phone: method === 'phone' ? value : null,
            name: sanitizedName,
            role,
            accountStatus,
            isActive: true,
            isVerified: role === 'buyer',
            phoneVerified: method === 'phone',
            emailVerified: method === 'email',
            locale: locale === 'en' ? 'en' : 'ar',
            ...(sanitizedStoreName && role !== 'buyer' && { nameEn: sanitizedStoreName }),
            ...(role === 'seller' && { sellerProfile: { create: { ...(sanitizedStoreName && { storeName: sanitizedStoreName }) } } }),
            ...(role === 'supplier' && { sellerProfile: { create: { ...(sanitizedStoreName && { storeName: sanitizedStoreName }) } } }),
            ...(role === 'logistics' && { logisticsProfile: { create: {} } }),
            ...(role === 'buyer' && { buyerProfile: { create: {} } }),
            ...(role === 'store_manager' && { wallet: { create: { balance: 0, totalEarned: 0, totalSpent: 0, currency: 'DZD' } } }),
            ...(role !== 'store_manager' && { wallet: { create: { balance: 0, totalEarned: 0, totalSpent: 0, currency: 'DZD' } } }),
          },
          select: {
            id: true, email: true, phone: true, name: true, nameEn: true,
            avatar: true, role: true, accountStatus: true, isActive: true,
            isVerified: true, phoneVerified: true, emailVerified: true,
            locale: true, createdAt: true,
            sellerProfile: { select: { id: true, storeName: true } },
            logisticsProfile: { select: { id: true } },
            buyerProfile: { select: { id: true } },
            wallet: { select: { id: true, balance: true } },
          },
        }),
        20000
      );

      if (created !== DB_TIMEOUT && created) {
        dbUser = created;
        console.log(`[register] Created in DB: ${created.id} (${created.name})`);
      }
    } catch (dbErr) {
      console.error('[register] DB not available, using local session:', dbErr);
      dbAvailable = false;
    }

    // ── Return user: from DB if available, otherwise create local session ──
    const user = dbUser || {
      id: userId,
      email: method === 'phone' ? `user_${value.replace(/\D/g, '')}@charyday.local` : value,
      phone: method === 'phone' ? value : null,
      name: sanitizedName,
      nameEn: sanitizedStoreName || sanitizedName,
      avatar: null,
      role,
      accountStatus,
      isActive: true,
      isVerified: role === 'buyer',
      phoneVerified: method === 'phone',
      emailVerified: method === 'email',
      locale: locale === 'en' ? 'en' : 'ar',
      createdAt: now,
      sellerProfile: role === 'seller' ? { id: userId, storeName: sanitizedStoreName } : null,
      logisticsProfile: role === 'logistics' ? { id: userId } : null,
      buyerProfile: role === 'buyer' ? { id: userId } : null,
      wallet: { id: userId, balance: 0 },
      ...(dbAvailable ? {} : { _localOnly: true }),
    };

    if (!dbUser) {
      console.log(`[register] Created local session: ${user.id} (${user.name}) — DB unavailable`);
    }

    return NextResponse.json({ success: true, user }, { status: dbUser ? 201 : 200 });

  } catch (error) {
    console.error('[register] Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create account' }, { status: 500 });
  }
}
