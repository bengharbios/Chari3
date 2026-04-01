import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTransition, ALL_ROLES } from '@/lib/role-transitions';
import type { RoleTransition } from '@/lib/role-transitions';

// ============================================
// ROLE TRANSITION ENGINE (shared config)
// ============================================

const VALID_ROLES = ALL_ROLES;

// ============================================
// GET — List users with advanced filtering & pagination
// ============================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const isActive = searchParams.get('isActive');
    const isVerified = searchParams.get('isVerified');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameEn: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (role) where.role = role;
    if (status) where.accountStatus = status;
    if (isActive === 'true') where.isActive = true;
    if (isActive === 'false') where.isActive = false;
    if (isVerified === 'verified') where.isVerified = true;
    if (isVerified === 'unverified') where.isVerified = false;

    // Validate sortBy
    const validSortFields = ['createdAt', 'name', 'role', 'accountStatus'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const skip = (page - 1) * pageSize;

    // Fetch users, total count, and stats in parallel
    const [users, total, pendingCount, suspendedCount, newThisMonth, activeCount] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [orderByField]: orderByDirection },
        select: {
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
          createdAt: true,
          _count: { select: { orders: true } },
          wallet: { select: { balance: true } },
          store: { select: { name: true, isActive: true } },
          sellerProfile: { select: { rating: true } },
          logisticsProfile: { select: { totalDeliveries: true } },
        },
      }),
      db.user.count({ where }),
      db.user.count({ where: { accountStatus: 'pending' } }),
      db.user.count({ where: { accountStatus: 'suspended' } }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      db.user.count({ where: { isActive: true, accountStatus: 'active' } }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      users,
      pagination: { page, pageSize, total, totalPages },
      stats: {
        total,
        active: activeCount,
        pending: pendingCount,
        suspended: suspendedCount,
        newThisMonth,
      },
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH — Update user (role, status, verification)
// ============================================

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, role, accountStatus, isActive, isVerified } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
        storeVerification: true,
        supplierVerification: true,
        freelancerVerification: true,
        store: true,
        logisticsProfile: true,
        buyerProfile: true,
        wallet: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const changes: string[] = [];

    // ---- ROLE CHANGE with Transition Engine ----
    if (role && VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]) && role !== existing.role) {
      const fromRole = existing.role;
      const toRole = role;

      // Look up transition from shared config
      const transition: RoleTransition | null = getTransition(fromRole, toRole);

      if (!transition || !transition.allowed) {
        const msg = transition
          ? (body.locale === 'ar' ? transition.messageAr : transition.messageEn)
          : 'This transition is not allowed';

        return NextResponse.json(
          { success: false, error: msg, blocked: true },
          { status: 403 }
        );
      }

      // Execute transition
      // 1. Create profile/verification records if needed
      if (transition.createsProfile && transition.createsProfile.length > 0) {
        for (const profileType of transition.createsProfile) {
          switch (profileType) {
            case 'SellerProfile':
              if (!existing.sellerProfile) {
                await db.sellerProfile.create({ data: { userId: id } });
                changes.push('created:SellerProfile');
              }
              break;
            case 'FreelancerVerification':
              if (!existing.freelancerVerification) {
                await db.freelancerVerification.create({ data: { userId: id } });
                changes.push('created:FreelancerVerification');
              }
              break;
            case 'StoreVerification':
              if (!existing.storeVerification) {
                await db.storeVerification.create({ data: { userId: id } });
                changes.push('created:StoreVerification');
              }
              break;
            case 'SupplierVerification':
              if (!existing.supplierVerification) {
                await db.supplierVerification.create({ data: { userId: id } });
                changes.push('created:SupplierVerification');
              }
              break;
            case 'LogisticsProfile':
              if (!existing.logisticsProfile) {
                await db.logisticsProfile.create({ data: { userId: id } });
                changes.push('created:LogisticsProfile');
              }
              break;
          }
        }
      }

      // 2. Deactivate resources if specified (e.g. Store for store_manager downgrades)
      if (transition.deactivates && transition.deactivates.length > 0) {
        for (const resource of transition.deactivates) {
          if (resource === 'Store' && existing.store) {
            await db.store.update({
              where: { managerId: id },
              data: { isActive: false },
            });
            changes.push('store→deactivated');
          }
        }
      }

      // 3. Create Wallet + BuyerProfile if buyer and not exists (all users should have these)
      if (toRole === 'buyer' || transition.newStatus === 'active') {
        if (!existing.buyerProfile) {
          await db.buyerProfile.create({ data: { userId: id } });
          changes.push('created:BuyerProfile');
        }
        if (!existing.wallet) {
          await db.wallet.create({ data: { userId: id } });
          changes.push('created:Wallet');
        }
      }

      // 4. Update user role and status
      const userData: Record<string, unknown> = { role: toRole };

      if (transition.requiresVerification) {
        userData.accountStatus = 'pending';
        userData.isVerified = false;
        changes.push('status→pending');
      } else {
        userData.accountStatus = transition.newStatus;
        if (transition.newStatus === 'active') {
          userData.isActive = true;
        }
        changes.push(`status→${transition.newStatus}`);
      }

      await db.user.update({ where: { id }, data: userData });
      changes.push(`role:${fromRole}→${toRole}`);

      // Audit log with full details
      await db.auditLog.create({
        data: {
          userId: id,
          adminId: body.adminId || null,
          action: 'admin_role_change',
          details: JSON.stringify({
            fromRole,
            toRole,
            transition: {
              allowed: transition.allowed,
              requiresVerification: transition.requiresVerification,
              newStatus: transition.newStatus,
              createsProfile: transition.createsProfile,
              deactivates: transition.deactivates,
              warningLevel: transition.warningLevel,
            },
            changes,
            previousValues: {
              role: existing.role,
              accountStatus: existing.accountStatus,
              isActive: existing.isActive,
              isVerified: existing.isVerified,
              hasSellerProfile: !!existing.sellerProfile,
              hasStore: !!existing.store,
              hasLogisticsProfile: !!existing.logisticsProfile,
              hasBuyerProfile: !!existing.buyerProfile,
            },
          }),
        },
      });

      const updatedUser = await db.user.findUnique({
        where: { id },
        select: {
          id: true, name: true, nameEn: true, email: true, phone: true,
          role: true, accountStatus: true, isActive: true, isVerified: true, createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        user: updatedUser,
        transition: {
          allowed: true,
          message: body.locale === 'ar' ? transition.messageAr : transition.messageEn,
          messageAr: transition.messageAr,
          messageEn: transition.messageEn,
          requiresVerification: transition.requiresVerification,
          newStatus: transition.newStatus,
          warningLevel: transition.warningLevel,
          createsProfile: transition.createsProfile,
          deactivates: transition.deactivates,
          impactsAr: transition.impactsAr,
          impactsEn: transition.impactsEn,
          changes,
        },
      });

      // If only role was requested (and it's the same), fall through to other fields
    } else {
      // ---- REGULAR FIELD UPDATES (no role change) ----
      const updateData: Record<string, unknown> = {};

      if (accountStatus && ['active', 'pending', 'incomplete', 'rejected', 'suspended'].includes(accountStatus)) {
        updateData.accountStatus = accountStatus;
        if (accountStatus === 'suspended') updateData.isActive = false;
        else if (accountStatus === 'active') updateData.isActive = true;
        changes.push(`accountStatus→${accountStatus}`);
      }
      if (typeof isActive === 'boolean') {
        updateData.isActive = isActive;
        changes.push(`isActive→${isActive}`);
      }
      if (typeof isVerified === 'boolean') {
        updateData.isVerified = isVerified;
        changes.push(`isVerified→${isVerified}`);
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid fields to update' },
          { status: 400 }
        );
      }

      const user = await db.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true, name: true, nameEn: true, email: true, phone: true,
          role: true, accountStatus: true, isActive: true, isVerified: true, createdAt: true,
        },
      });

      await db.auditLog.create({
        data: {
          userId: id,
          adminId: body.adminId || null,
          action: 'admin_update',
          details: JSON.stringify({
            updatedFields: Object.keys(updateData),
            previousValues: {
              role: existing.role, accountStatus: existing.accountStatus,
              isActive: existing.isActive, isVerified: existing.isVerified,
            },
            newValues: updateData,
          }),
        },
      });

      return NextResponse.json({ success: true, user, changes });
    }
  } catch (error) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE — Soft delete user (suspend + deactivate)
// ============================================

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, reason } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: { accountStatus: 'suspended', isActive: false },
      select: { id: true, name: true, email: true },
    });

    await db.auditLog.create({
      data: {
        userId: id,
        adminId: body.adminId || null,
        action: 'admin_delete',
        details: JSON.stringify({
          reason: reason || 'No reason provided',
          deletedUserName: existing.name,
          deletedUserRole: existing.role,
        }),
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Admin users DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
