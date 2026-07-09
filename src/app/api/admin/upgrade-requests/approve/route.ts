import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/better-auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, packageId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true }
    });

    if (!user || user.role !== 'seller' || !user.sellerProfile) {
      return NextResponse.json({ success: false, error: 'Invalid user or not a seller' }, { status: 400 });
    }

    const upgradeRequest = await db.upgradeRequest.findFirst({
      where: { userId: userId, status: 'READY_FOR_REVIEW' }
    });

    if (!user.sellerProfile.wantsUpgrade && !upgradeRequest) {
      return NextResponse.json({ success: false, error: 'Seller has not requested an upgrade or request is not ready for review' }, { status: 400 });
    }

    // Determine store name (slug needs to be unique)
    let storeName = user.sellerProfile.storeName || user.name || 'Store';
    let slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!slug) slug = 'store-' + crypto.randomBytes(4).toString('hex');
    
    // Ensure slug uniqueness
    let isUnique = false;
    let counter = 1;
    let finalSlug = slug;
    while (!isUnique) {
      const existing = await db.store.findUnique({ where: { slug: finalSlug } });
      if (!existing) {
        isUnique = true;
      } else {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
    }

    // Transaction to update role, create store, and reset wantsUpgrade
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { role: 'store_manager' }
      });

      await tx.sellerProfile.update({
        where: { id: user.sellerProfile!.id },
        data: { wantsUpgrade: false, upgradeRequestedAt: null }
      });

      const store = await tx.store.create({
        data: {
          name: storeName,
          nameEn: user.sellerProfile!.storeNameEn || user.name || 'Store',
          slug: finalSlug,
          managerId: user.id,
          packageId: packageId || null,
          logo: user.sellerProfile!.logo,
          coverImage: user.sellerProfile!.coverImage,
          addonBusinessUpgrade: true
        }
      });

      // Optionally create a staff record for the manager
      await tx.storeStaff.create({
        data: {
          role: 'owner',
          storeId: store.id,
          userId: user.id
        }
      });

      if (upgradeRequest) {
        await tx.upgradeRequest.update({
          where: { id: upgradeRequest.id },
          data: {
            status: 'APPROVED',
            reviewedBy: session.user.id,
            reviewedAt: new Date()
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/admin/upgrade-requests/approve] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
