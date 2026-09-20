import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'all'; // all, active, suspended, pending
    const packageId = searchParams.get('packageId') || 'all';
    const paymentModel = searchParams.get('paymentModel') || 'all';

    // Build dynamic where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameEn: { contains: search } },
        { slug: { contains: search } },
        { manager: { name: { contains: search } } },
        { manager: { email: { contains: search } } },
        { manager: { phone: { contains: search } } },
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'suspended') {
      where.isActive = false;
    }

    if (packageId !== 'all') {
      where.packageId = packageId;
    }

    const skip = (page - 1) * limit;

    // Fetch stores count and stores with related models
    const [total, stores, totalActive, totalSuspended, totalSalesAggregate] = await Promise.all([
      db.store.count({ where }),
      db.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              email: true,
              phone: true,
              role: true,
              accountStatus: true,
              isActive: true,
              avatar: true,
            }
          },
          package: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              priceMonthly: true,
              maxProducts: true,
              maxBranches: true,
            }
          },
          staff: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  isActive: true,
                  avatar: true,
                }
              }
            }
          },
          _count: {
            select: {
              products: true,
              staff: true,
            }
          }
        }
      }),
      db.store.count({ where: { isActive: true } }),
      db.store.count({ where: { isActive: false } }),
      db.store.aggregate({
        _sum: {
          totalSales: true,
          totalEarnings: true,
        },
        _count: {
          id: true,
        }
      })
    ]);

    // Also fetch all packages for the filter dropdown
    const packages = await db.sellerPackage.findMany({
      select: { id: true, nameAr: true, nameEn: true },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: {
        stores: stores.map(store => ({
          id: store.id,
          name: store.name,
          nameEn: store.nameEn,
          slug: store.slug,
          description: store.description,
          logo: store.logo,
          coverImage: store.coverImage,
          isActive: store.isActive,
          rating: store.rating,
          totalSales: store.totalSales,
          totalEarnings: store.totalEarnings,
          commission: store.commission,
          level: store.level,
          customDomain: store.customDomain,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
          manager: store.manager,
          package: store.package,
          stats: {
            productsCount: store._count.products,
            staffCount: store._count.staff,
          },
          staff: store.staff.map(s => ({
            id: s.id,
            role: s.role,
            status: s.status,
            joinedAt: s.joinedAt,
            user: s.user
          })),
          features: {
            addonMobileApp: (store as any).addonMobileApp ?? false,
            addonWhatsAppSupport: (store as any).addonWhatsAppSupport ?? false,
            addonAdvancedCRM: (store as any).addonAdvancedCRM ?? false,
            addonEchangoPOS: (store as any).addonEchangoPOS ?? false,
            addonBusinessUpgrade: (store as any).addonBusinessUpgrade ?? false,
          }
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
        aggregates: {
          totalStores: totalSalesAggregate._count.id || 0,
          activeStores: totalActive,
          suspendedStores: totalSuspended,
          totalSalesSum: totalSalesAggregate._sum.totalSales || 0,
          totalEarningsSum: totalSalesAggregate._sum.totalEarnings || 0,
        },
        packages
      }
    });

  } catch (error: any) {
    console.error('[API admin/stores GET] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, commission, isActive, packageId, slug, features } = body;

    if (!storeId) {
      return NextResponse.json({ success: false, error: 'Store ID is required' }, { status: 400 });
    }

    const existingStore = await db.store.findUnique({
      where: { id: storeId }
    });

    if (!existingStore) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (typeof commission === 'number') {
      updateData.commission = Math.max(0, Math.min(100, commission));
    }

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (packageId !== undefined) {
      updateData.packageId = packageId || null;
    }

    if (slug && typeof slug === 'string' && slug.trim() !== existingStore.slug) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      // check unique
      const slugExists = await db.store.findFirst({
        where: { slug: cleanSlug, id: { not: storeId } }
      });
      if (slugExists) {
        return NextResponse.json({ success: false, error: 'Slug already taken by another store' }, { status: 400 });
      }
      updateData.slug = cleanSlug;
      updateData.slugUpdatedAt = new Date();
    }

    if (features && typeof features === 'object') {
      if (features.addonMobileApp !== undefined) updateData.addonMobileApp = Boolean(features.addonMobileApp);
      if (features.addonWhatsAppSupport !== undefined) updateData.addonWhatsAppSupport = Boolean(features.addonWhatsAppSupport);
      if (features.addonAdvancedCRM !== undefined) updateData.addonAdvancedCRM = Boolean(features.addonAdvancedCRM);
      if (features.addonEchangoPOS !== undefined) updateData.addonEchangoPOS = Boolean(features.addonEchangoPOS);
      if (features.addonBusinessUpgrade !== undefined) updateData.addonBusinessUpgrade = Boolean(features.addonBusinessUpgrade);
    }

    const updatedStore = await db.store.update({
      where: { id: storeId },
      data: updateData,
      include: {
        package: true,
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Audit Logging in AdminAuditLog
    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || reqHeaders.get('x-real-ip') || '127.0.0.1';

    await db.adminAuditLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_STORE_SETTINGS',
        targetId: storeId,
        details: {
          before: {
            commission: existingStore.commission,
            isActive: existingStore.isActive,
            packageId: existingStore.packageId,
            slug: existingStore.slug
          },
          after: {
            commission: updatedStore.commission,
            isActive: updatedStore.isActive,
            packageId: updatedStore.packageId,
            slug: updatedStore.slug
          }
        },
        ipAddress: ip
      }
    });

    return NextResponse.json({ success: true, store: updatedStore });

  } catch (error: any) {
    console.error('[API admin/stores PATCH] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
