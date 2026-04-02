import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// Item keys per role — used for full rejection
// ============================================
const ROLE_REJECTION_ITEMS: Record<string, string[]> = {
  store_manager: ['commercial_register', 'bank_account', 'manager_id'],
  seller: ['national_id', 'freelance_document', 'bank_account', 'liveness'],
  supplier: ['commercial_license', 'import_license', 'bank_account'],
  logistics: ['transport_license', 'insurance', 'fleet_info', 'bank_account'],
};

// ============================================
// POST /api/admin/review/[userId]
// Body: { action: 'approve' | 'reject' | 'request_edit', reason?: string, editItems?: string[], adminId: string }
// ============================================

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
  user: Awaited<ReturnType<typeof db.user.findUnique>>,
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

  // Update verification table
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

    // Create Store if not exists
    if (!user.store) {
      await db.store.create({
        data: {
          name: user.name,
          nameEn: user.nameEn || user.name,
          slug: `store-${user.id}`,
          managerId: user.id,
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

  return NextResponse.json({ success: true, newStatus: 'active' });
}

// -------------------------------------------
// Reject (full rejection — all items)
// -------------------------------------------

async function rejectUser(
  user: Awaited<ReturnType<typeof db.user.findUnique>>,
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

  return NextResponse.json({ success: true, newStatus: 'rejected' });
}

// -------------------------------------------
// Request Edit (partial rejection — specific items)
// -------------------------------------------

async function requestEditUser(
  user: Awaited<ReturnType<typeof db.user.findUnique>>,
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

  return NextResponse.json({
    success: true,
    newStatus: 'rejected',
    editItems: editItems || [],
    reason: reason || '',
  });
}
