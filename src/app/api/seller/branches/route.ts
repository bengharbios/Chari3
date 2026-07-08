import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/seller/branches?userId=xxx
// Returns all branches the user owns or manages as staff
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    // Verify user is business type
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        sellerProfile: { select: { merchantType: true } }
      }
    });
    if (!user || user.sellerProfile?.merchantType !== 'business') {
      return NextResponse.json({ success: false, error: 'only_business_sellers_allowed' }, { status: 403 });
    }

    const stores = await db.store.findMany({
      where: {
        OR: [
          { managerId: userId },
          { staff: { some: { userId, status: 'active' } } }
        ]
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        logo: true,
        isActive: true,
        createdAt: true,
        managerId: true,
        manager: {
          select: { id: true, name: true, email: true }
        },
        staff: {
          where: { status: 'active' },
          select: {
            id: true,
            role: true,
            status: true,
            joinedAt: true,
            user: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark which store is the "primary" (directly managed) vs branch (staff-linked)
    const enriched = stores.map(s => ({
      ...s,
      isPrimary: s.managerId === userId,
      myRole: s.managerId === userId
        ? 'owner'
        : (s.staff.find((m: any) => m.user.id === userId)?.role ?? 'staff')
    }));

    return NextResponse.json({ success: true, branches: enriched });
  } catch (error) {
    console.error('[seller/branches GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/seller/branches
// Creates a new branch store and links the current user as its store_manager
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, nameEn } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'branch_name_required' }, { status: 400 });
    }

    // Verify user exists and check merchantType
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        sellerProfile: { select: { merchantType: true } }
      }
    });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (user.sellerProfile?.merchantType !== 'business') {
      return NextResponse.json({ success: false, error: 'only_business_sellers_allowed' }, { status: 403 });
    }

    // Check current branch count for this user (limit to reasonable number)
    const existingCount = await db.store.count({
      where: {
        OR: [
          { managerId: userId },
          { staff: { some: { userId, status: 'active' } } }
        ]
      }
    });
    if (existingCount >= 10) {
      return NextResponse.json({ success: false, error: 'branch_limit_reached' }, { status: 400 });
    }

    const ts = Date.now();

    // 1. Create a technical owner (dummy user) for the branch store
    const dummyOwnerId = `branch-owner-${userId.substring(0, 8)}-${ts}`;
    await db.user.create({
      data: {
        id: dummyOwnerId,
        email: `branchowner.${ts}@internal.chariday.com`,
        name: `Branch Owner (${name})`,
        role: 'seller',
        accountStatus: 'active',
        isActive: true,
      }
    });

    // 2. Create the branch store
    const branchId = `branch-${userId.substring(0, 8)}-${ts}`;
    const slug = `branch-${ts}`;
    const branch = await db.store.create({
      data: {
        id: branchId,
        name: name.trim(),
        nameEn: nameEn?.trim() || name.trim(),
        slug,
        managerId: dummyOwnerId,
        isActive: true,
      }
    });

    // 3. Link the actual user as store_manager staff
    await db.storeStaff.create({
      data: {
        storeId: branchId,
        userId,
        role: 'store_manager',
        status: 'active'
      }
    });

    return NextResponse.json({
      success: true,
      branch: {
        id: branch.id,
        name: branch.name,
        nameEn: branch.nameEn,
        slug: branch.slug,
        isActive: branch.isActive,
      }
    });
  } catch (error) {
    console.error('[seller/branches POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
