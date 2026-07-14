import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncStoreStatusWithSubscription } from '@/lib/billing';

// ============================================
// Item keys per role — used for full rejection
// ============================================
const ROLE_REJECTION_ITEMS: Record<string, string[]> = {
  store: ['commercial_register', 'bank_account', 'manager_id'],
  store_manager: ['commercial_register', 'bank_account', 'manager_id'],
  seller: ['commercial_register', 'bank_account', 'manager_id'],
  freelancer: ['commercial_register', 'bank_account', 'manager_id'],
  supplier: ['commercial_license', 'import_license', 'bank_account'],
  logistics: ['transport_license', 'insurance', 'fleet_info', 'bank_account'],
};

// ============================================
// POST /api/admin/review/[userId]
// Body: { action: 'approve' | 'reject' | 'request_edit', reason?: string, editItems?: string[], adminId: string }
// ============================================

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { action, reason, editItems, adminId } = body;

    if (!userId || !action || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, action, adminId' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'request_edit'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be approve, reject, or request_edit' },
        { status: 400 }
      );
    }

    // Fetch user with ALL verification relations
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        storeVerification: true,
        freelancerVerification: true,
        supplierVerification: true,
        logisticsVerification: true,
        store: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.accountStatus !== 'pending') {
      return NextResponse.json(
        { success: false, error: `User is not in pending status (current: ${user.accountStatus})` },
        { status: 400 }
      );
    }

    // Execute action
    if (action === 'approve') {
      return approveUser(user, adminId);
    } else if (action === 'reject') {
      return rejectUser(user, adminId, reason);
    } else {
      return requestEditUser(user, adminId, reason, editItems);
    }
  } catch (error) {
    console.error('[POST /api/admin/review/[userId]]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process review action' },
      { status: 500 }
    );
  }
}

// -------------------------------------------
// Approve
// -------------------------------------------

async function approveUser(
  user: any,
  adminId: string
) {
  if (!user) throw new Error('User not found');

  // Determine role
  const role = user.role;

  // Update user
  await db.user.update({
    where: { id: user.id },
    data: {
      accountStatus: 'active',
      isVerified: true,
    },
  });

  // Fetch system settings for default package assignment
  const settings = await db.systemSetting.findMany();
  const s = settings.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, any>);

  const defaultPackageId = s.billing_default_package_id || 'none';
  const trialOnRegistration = s.billing_trial_on_registration === 'true' || s.billing_trial_on_registration === true;
  const trialDays = parseInt(s.billing_trial_days || '14');

  let assignedPackageId: string | null = null;
  if (defaultPackageId !== 'none') {
    const pkgExists = await db.sellerPackage.findUnique({
      where: { id: defaultPackageId }
    });
    if (pkgExists) {
      assignedPackageId = defaultPackageId;
    }
  }

  // Update verification table depending on the role
  if (role === 'store' || role === 'store_manager') {
    if (user.storeVerification) {
      await db.storeVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'approved',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  if (role === 'freelancer' || role === 'seller') {
    if (user.freelancerVerification) {
      await db.freelancerVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'approved',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  if (role === 'supplier') {
    if (user.supplierVerification) {
      await db.supplierVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'approved',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  // Ensure all selling roles have a SellerProfile and a Store storefront
  const sellingRoles = ['store', 'store_manager', 'freelancer', 'seller', 'supplier'];
  if (sellingRoles.includes(role)) {
    // 1. Sync isVerified flag to SellerProfile
    await db.sellerProfile.upsert({
      where: { userId: user.id },
      update: {
        isVerified: true,
        packageId: assignedPackageId,
      },
      create: {
        userId: user.id,
        isVerified: true,
        storeName: user.name,
        storeNameEn: user.nameEn || user.name,
        packageId: assignedPackageId,
      },
    });

    // 2. Create Store if not exists
    if (!user.store) {
      let cleanSlug = `store-${user.id}`;
      if (user.nameEn) {
        cleanSlug = user.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (!cleanSlug) cleanSlug = `store-${user.id}`;
      }

      // Check for slug uniqueness
      const existingSlug = await db.store.findUnique({ where: { slug: cleanSlug } });
      if (existingSlug) {
        cleanSlug = `store-${user.id}`;
      }

      await db.store.create({
        data: {
          name: user.name,
          nameEn: user.nameEn || user.name,
          slug: cleanSlug,
          managerId: user.id,
          ownerId: user.id,      // ← real human owner
          packageId: assignedPackageId,
        },
      });
    } else if (assignedPackageId) {
      await db.store.update({
        where: { id: user.store.id },
        data: { packageId: assignedPackageId },
      });
    }
  }

  if (role === 'logistics') {
    if (user.logisticsVerification) {
      await db.logisticsVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'approved',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }

    // Create LogisticsProfile if not exists
    if (!user.logisticsProfile) {
      await db.logisticsProfile.create({
        data: {
          userId: user.id,
        },
      });
    }
  }

  // Create Subscription if default package is assigned
  if (assignedPackageId) {
    const now = new Date();
    let subscriptionStatus = 'ACTIVE';
    let trialEndsAt: Date | null = null;
    let endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    if (trialOnRegistration) {
      subscriptionStatus = 'TRIAL';
      trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
      endDate = trialEndsAt;
    }

    const pkg = await db.sellerPackage.findUnique({ where: { id: assignedPackageId } });
    const totalMonthly = pkg ? pkg.price : 0;

    // Check if subscription already exists to avoid duplicate
    const existingSub = await db.subscription.findFirst({
      where: { userId: user.id, packageId: assignedPackageId },
    });

    if (!existingSub) {
      await db.subscription.create({
        data: {
          userId: user.id,
          packageId: assignedPackageId,
          status: subscriptionStatus,
          billingCycle: 'MONTHLY',
          startDate: now,
          endDate,
          trialEndsAt,
          totalMonthly,
        },
      });

      // Synchronize store status immediately with subscription
      await syncStoreStatusWithSubscription(user.id, subscriptionStatus);
    }
  }

  // Create AuditLog
  await db.auditLog.create({
    data: {
      userId: user.id,
      adminId,
      action: 'approved',
      details: JSON.stringify({
        reason: 'Account approved - all documents valid',
        reasonEn: 'Account approved - all documents valid',
        role,
      }),
    },
  });

  // Create Notification
  await db.notification.create({
    data: {
      userId: user.id,
      type: 'VERIFICATION_APPROVED',
      title: 'تم قبول طلب التوثيق',
      titleEn: 'Verification Approved',
      body: 'تم قبول طلب التوثيق الخاص بك، حسابك الآن مفعل ويمكنك استخدام كافة الصلاحيات.',
      bodyEn: 'Your verification request has been approved. Your account is now active.',
    }
  });

  return NextResponse.json({ success: true, newStatus: 'active' });
}

// -------------------------------------------
// Reject (full rejection — all items)
// -------------------------------------------

async function rejectUser(
  user: any,
  adminId: string,
  reason?: string
) {
  if (!user) throw new Error('User not found');

  const role = user.role;

  // Use actual item keys (not reason text) so status API can mark each item
  const rejectionItemKeys = ROLE_REJECTION_ITEMS[role] || [];
  const rejectionReasons = rejectionItemKeys.length > 0
    ? JSON.stringify(rejectionItemKeys)
    : null;

  await db.user.update({
    where: { id: user.id },
    data: {
      accountStatus: 'rejected',
    },
  });

  if (role === 'store' || role === 'store_manager') {
    if (user.storeVerification) {
      await db.storeVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'rejected',
          rejectionReasons,
          adminNotes: reason || null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  if (role === 'freelancer' || role === 'seller') {
    if (user.freelancerVerification) {
      await db.freelancerVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'rejected',
          rejectionReasons,
          adminNotes: reason || null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  if (role === 'supplier') {
    if (user.supplierVerification) {
      await db.supplierVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'rejected',
          rejectionReasons,
          adminNotes: reason || null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  if (role === 'logistics') {
    if (user.logisticsVerification) {
      await db.logisticsVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'rejected',
          rejectionReasons,
          adminNotes: reason || null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  // Create AuditLog
  await db.auditLog.create({
    data: {
      userId: user.id,
      adminId,
      action: 'rejected',
      details: JSON.stringify({
        reason: reason || 'تم رفض الطلب',
        reasonEn: reason || 'Request rejected',
        role,
      }),
    },
  });

  // Create Notification
  await db.notification.create({
    data: {
      userId: user.id,
      type: 'VERIFICATION_REJECTED',
      title: 'تم رفض طلب التوثيق',
      titleEn: 'Verification Rejected',
      body: `تم رفض طلب التوثيق الخاص بك. السبب: ${reason || 'تم رفض الطلب'}`,
      bodyEn: `Your verification request has been rejected. Reason: ${reason || 'Request rejected'}`,
    }
  });

  return NextResponse.json({ success: true, newStatus: 'rejected' });
}

// -------------------------------------------
// Request Edit (partial rejection — specific items)
// -------------------------------------------

async function requestEditUser(
  user: any,
  adminId: string,
  reason?: string,
  editItems?: string[]
) {
  if (!user) throw new Error('User not found');

  // Set status to rejected to trigger resubmit flow
  await db.user.update({
    where: { id: user.id },
    data: {
      accountStatus: 'rejected',
    },
  });

  const detailsPayload: Record<string, unknown> = {
    reason: reason || '',
    reasonEn: reason || '',
    editItems: editItems || [],
    role: user.role,
  };

  const role = user.role;

  // Store the selected item keys (not reason text)
  const rejectionReasons = editItems && editItems.length > 0
    ? JSON.stringify(editItems)
    : null;

  if (role === 'store' || role === 'store_manager') {
    if (user.storeVerification) {
      await db.storeVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'rejected',
          rejectionReasons,
          adminNotes: reason || null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  if (role === 'freelancer' || role === 'seller') {
    if (user.freelancerVerification) {
      await db.freelancerVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'rejected',
          rejectionReasons,
          adminNotes: reason || null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  if (role === 'supplier') {
    if (user.supplierVerification) {
      await db.supplierVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'rejected',
          rejectionReasons,
          adminNotes: reason || null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  if (role === 'logistics') {
    if (user.logisticsVerification) {
      await db.logisticsVerification.update({
        where: { userId: user.id },
        data: {
          verificationStatus: 'rejected',
          rejectionReasons,
          adminNotes: reason || null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  // Create AuditLog
  await db.auditLog.create({
    data: {
      userId: user.id,
      adminId,
      action: 'request_edit',
      details: JSON.stringify(detailsPayload),
    },
  });

  // Create Notification
  await db.notification.create({
    data: {
      userId: user.id,
      type: 'VERIFICATION_EDIT_REQUIRED',
      title: 'مطلوب تعديل على طلب التوثيق',
      titleEn: 'Verification Edit Required',
      body: `يرجى تعديل بعض بيانات طلب التوثيق الخاص بك. ملاحظة: ${reason || 'تعديل مطلوب'}`,
      bodyEn: `Please edit some details in your verification request. Note: ${reason || 'Edit required'}`,
    }
  });

  return NextResponse.json({
    success: true,
    newStatus: 'rejected',
    editItems: editItems || [],
    reason: reason || '',
  });
}
