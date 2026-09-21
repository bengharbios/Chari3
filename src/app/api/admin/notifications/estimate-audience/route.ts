import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// In-memory short-lived cache (30s TTL) to prevent query hammering
interface CacheEntry {
  count: number;
  expiresAt: number;
}
const audienceCache = new Map<string, CacheEntry>();

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      targetRole = 'all',
      targetStatus = 'all',
      targetLanguage = 'all',
      targetUserId,
      targetStoreId,
    } = body;

    // Cache key
    const cacheKey = `${targetRole}_${targetStatus}_${targetLanguage}_${targetUserId || ''}_${targetStoreId || ''}`;
    const now = Date.now();
    const cached = audienceCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json({ success: true, count: cached.count, cached: true });
    }

    // Clean up stale cache periodically
    if (audienceCache.size > 200) {
      for (const [key, entry] of audienceCache.entries()) {
        if (entry.expiresAt <= now) audienceCache.delete(key);
      }
    }

    let count = 0;

    if (targetRole === 'user' && targetUserId) {
      const user = await db.user.findFirst({
        where: {
          OR: [
            { id: targetUserId },
            { email: targetUserId }
          ]
        },
        select: { id: true }
      });
      count = user ? 1 : 0;
    } else if (targetRole === 'specific_store' && targetStoreId) {
      const store = await db.store.findUnique({
        where: { id: targetStoreId },
        select: {
          managerId: true,
          staff: { select: { userId: true } }
        }
      });
      if (store) {
        const userIds = new Set<string>();
        if (store.managerId) userIds.add(store.managerId);
        store.staff.forEach(s => userIds.add(s.userId));
        count = userIds.size;
      }
    } else {
      const whereClause: any = {};

      // Role filter
      if (targetRole && targetRole !== 'all') {
        if (targetRole === 'seller') {
          whereClause.role = { in: ['seller', 'store'] };
        } else if (targetRole === 'admin') {
          whereClause.role = { in: ['admin', 'super_admin'] };
        } else if (targetRole === 'logistics') {
          whereClause.role = { in: ['logistics', 'delivery'] };
        } else {
          whereClause.role = targetRole;
        }
      }

      // Status filter
      if (targetStatus && targetStatus !== 'all') {
        if (targetStatus === 'active') {
          whereClause.accountStatus = 'active';
          whereClause.isActive = true;
        } else if (targetStatus === 'incomplete') {
          whereClause.accountStatus = 'incomplete';
        } else if (targetStatus === 'pending') {
          whereClause.accountStatus = 'pending';
        } else if (targetStatus === 'suspended') {
          whereClause.OR = [
            { accountStatus: 'suspended' },
            { isActive: false }
          ];
        } else if (targetStatus === 'rejected') {
          whereClause.accountStatus = 'rejected';
        }
      }

      // Language filter
      if (targetLanguage && targetLanguage !== 'all') {
        whereClause.locale = targetLanguage;
      }

      count = await db.user.count({ where: whereClause });
    }

    audienceCache.set(cacheKey, { count, expiresAt: now + 30000 });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('[estimate-audience error]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
