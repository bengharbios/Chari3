import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 25;

const TOKEN = 'chari3-seed-2026';

/**
 * One-time migration endpoint: backfills Store.ownerId for all existing stores.
 *
 * Logic:
 *   1. If store.managerId is a REAL user (role in store/seller/etc.) → ownerId = managerId
 *   2. Else if store has a staff member with an APPROVED UpgradeRequest → ownerId = that user
 *   3. Else if store has staff member with BusinessVerification → ownerId = that user
 *   4. Else → skip (manual fix required)
 *
 * GET /api/admin/backfill-owner-id?token=chari3-seed-2026
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (token !== TOKEN) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const results: string[] = [];
  let fixed = 0, skipped = 0;

  try {
    // Fetch all stores that don't have ownerId set yet
    const stores = await db.store.findMany({
      where: { ownerId: null },
      include: {
        manager: { select: { id: true, role: true, name: true } },
        staff: {
          include: {
            user: { select: { id: true, role: true, name: true } }
          }
        }
      }
    });

    results.push(`📋 Found ${stores.length} stores without ownerId`);

    const REAL_ROLES = ['store', 'store_manager', 'seller', 'freelancer', 'supplier'];

    for (const store of stores) {
      let ownerIdToSet: string | null = null;

      // Signal 1: manager is a real user (not a dummy)
      if (REAL_ROLES.includes(store.manager.role)) {
        ownerIdToSet = store.managerId;
      }

      // Signal 2: staff member with APPROVED UpgradeRequest
      if (!ownerIdToSet) {
        for (const member of store.staff) {
          const upgrade = await db.upgradeRequest.findFirst({
            where: { userId: member.user.id, status: 'APPROVED' }
          });
          if (upgrade) {
            ownerIdToSet = member.user.id;
            break;
          }
        }
      }

      // Signal 3: staff member with BusinessVerification
      if (!ownerIdToSet) {
        for (const member of store.staff) {
          const biz = await db.businessVerification.findFirst({
            where: { userId: member.user.id }
          });
          if (biz) {
            ownerIdToSet = member.user.id;
            break;
          }
        }
      }

      if (ownerIdToSet) {
        await db.store.update({
          where: { id: store.id },
          data: { ownerId: ownerIdToSet }
        });
        results.push(`✅ Store "${store.name}" → ownerId set to ${ownerIdToSet}`);
        fixed++;
      } else {
        results.push(`⚠️ Store "${store.name}" (${store.id}) → could not determine owner, skipped`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: { total: stores.length, fixed, skipped },
      details: results
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg, details: results }, { status: 500 });
  }
}
