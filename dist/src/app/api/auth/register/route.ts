import { NextResponse } from 'next/server';
import { validatePhone, validateEmail, validateFullName, validateRole } from '@/lib/validators';
import { randomUUID } from 'crypto';

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
    console.error(`[register] DB failed:`, err);
    return DB_TIMEOUT;
  } finally {
    clearTimeout(timer);
  }
}

// Fields to select when returning a user
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
    const { method, value, fullName, role, storeName, locale } = body;

    // ── Validate required fields ──
    if (!method || !value || !fullName || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (method !== 'phone' && method !== 'email') {
      return NextResponse.json(
        { success: false, message: 'Invalid method' },
        { status: 400 }
      );
    }

    if (!validateFullName(fullName)) {
      return NextResponse.json(
        { success: false, message: 'Name must be 2-100 characters' },
        { status: 400 }
      );
    }

    if (!validateRole(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    if (method === 'phone' && !validatePhone(value)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number' },
        { status: 400 }
      );
    }

    if (method === 'email' && !validateEmail(value)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // ── Prepare data ──
    // Only trim — React auto-escapes JSX, no HTML-entity encoding at storage
    const sanitizedName = fullName.trim();
    const sanitizedStoreName = storeName ? storeName.trim() : undefined;
    const accountStatus = role === 'buyer' ? 'active' : 'incomplete';
    const userId = randomUUID();
    const now = new Date().toISOString();

    // ── Try DB operations (best-effort with timeout) ──
    let dbUser: Record<string, unknown> | null = null;

    try {
      const { db } = await import('@/lib/db');

      // ── Step 1: Check if user already exists ──
      const existing = await withTimeout(
        db.user.findFirst({
          where: method === 'phone' ? { phone: value } : { email: value },
          select: USER_SELECT,
        }),
        DB_TIMEOUT_MS
      );

      if (existing !== DB_TIMEOUT && existing) {
        // User exists — return them
        console.log(`[register] Existing user: ${existing.id} (${existing.name})`);
        return NextResponse.json({ success: true, alreadyExists: true, user: existing });
      }

      if (existing === DB_TIMEOUT) {
        console.log('[register] DB timeout on user lookup, proceeding with creation attempt');
      }

      // ── Step 2: Create user + role-specific profile + wallet in one transaction ──
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
            // Store name as nameEn for English display
            ...(sanitizedStoreName && role !== 'buyer' && { nameEn: sanitizedStoreName }),
            // Role-specific profiles
            ...(role === 'seller' && {
              sellerProfile: { create: { ...(sanitizedStoreName && { storeName: sanitizedStoreName }) } },
            }),
            ...(role === 'supplier' && {
              sellerProfile: { create: { ...(sanitizedStoreName && { storeName: sanitizedStoreName }) } },
            }),
            ...(role === 'store_manager' && {
              sellerProfile: { create: { ...(sanitizedStoreName && { storeName: sanitizedStoreName }) } },
            }),
            ...(role === 'logistics' && {
              logisticsProfile: { create: {} },
            }),
            ...(role === 'buyer' && {
              buyerProfile: { create: {} },
            }),
            // Wallet (all roles get one)
            wallet: {
              create: {
                balance: 0,
                totalEarned: 0,
                totalSpent: 0,
                currency: 'DZD',
              },
            },
          },
          select: USER_SELECT,
        }),
        20000
      );

      if (created !== DB_TIMEOUT && created) {
        dbUser = created;
        console.log(`[register] Created in DB: ${created.id} (${created.name})`);
      }
    } catch (dbErr) {
      console.error('[register] DB not available, using local session:', dbErr);
    }

    // ── Fallback: Return local user if DB unavailable ──
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
      sellerProfile: ['seller', 'supplier', 'store_manager'].includes(role)
        ? { id: userId, storeName: sanitizedStoreName }
        : null,
      logisticsProfile: role === 'logistics' ? { id: userId } : null,
      buyerProfile: role === 'buyer' ? { id: userId } : null,
      wallet: { id: userId, balance: 0 },
      _localOnly: true,
    };

    if (!dbUser) {
      console.log(`[register] Created local session: ${user.id} (${user.name}) — DB unavailable`);
    }

    return NextResponse.json({ success: true, user }, { status: dbUser ? 201 : 200 });

  } catch (error) {
    console.error('[register] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create account' },
      { status: 500 }
    );
  }
}
