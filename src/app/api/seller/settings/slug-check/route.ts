import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const RESERVED_SLUGS = [
  'admin', 'api', 'login', 'register', 'checkout', 'settings', 'store',
  'seller', 'dashboard', 'support', 'help', 'search', 'terms', 'privacy',
  'blog', 'news', 'auth', 'signup', 'signin', 'verification', 'onboarding',
  'suppliers', 'freelancers', 'logistics', 'buyer', 'orders', 'products'
];

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    const storeId = req.nextUrl.searchParams.get('storeId');
    const userId = req.nextUrl.searchParams.get('userId');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug_required' }, { status: 400 });
    }

    const slugToCheck = slug.toLowerCase().trim();
    const slugRegex = /^[a-z0-9-]+$/;

    if (!slugRegex.test(slugToCheck) || slugToCheck.length < 3 || slugToCheck.length > 30 || RESERVED_SLUGS.includes(slugToCheck)) {
      return NextResponse.json({ success: true, available: false, reason: 'invalid_format' });
    }

    // Check if another store has this slug
    const conflictingStore = await db.store.findFirst({
      where: {
        slug: slugToCheck,
        NOT: storeId ? { id: storeId } : undefined
      }
    });

    if (conflictingStore) {
      return NextResponse.json({ success: true, available: false, reason: 'taken' });
    }

    // If storeId is provided, check cooldown rule
    if (storeId) {
      const store = await db.store.findUnique({
        where: { id: storeId }
      });

      if (store && store.slug === slugToCheck) {
        return NextResponse.json({ success: true, available: true, message: 'current_slug' });
      }

      if (store && store.slugUpdatedAt) {
        const diffMs = Date.now() - new Date(store.slugUpdatedAt).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 60) {
          return NextResponse.json({
            success: true,
            available: false,
            reason: 'cooldown_active',
            daysRemaining: 60 - diffDays
          });
        }
      }
    } else if (userId) {
      // Check cooldown using user's store
      const store = await db.store.findFirst({
        where: { managerId: userId }
      });

      if (store && store.slug === slugToCheck) {
        return NextResponse.json({ success: true, available: true, message: 'current_slug' });
      }

      if (store && store.slugUpdatedAt) {
        const diffMs = Date.now() - new Date(store.slugUpdatedAt).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 60) {
          return NextResponse.json({
            success: true,
            available: false,
            reason: 'cooldown_active',
            daysRemaining: 60 - diffDays
          });
        }
      }
    }

    return NextResponse.json({ success: true, available: true });
  } catch (error) {
    console.error('[slug-check GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
