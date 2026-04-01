import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// GET /api/admin/review — Pending merchants list
// GET /api/admin/review?action=audit — Audit log
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'audit') {
      return await getAuditLogs();
    }

    return await getPendingMerchants();
  } catch (error) {
    console.error('[GET /api/admin/review]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Return success with empty data instead of 500 to avoid UI errors
    return NextResponse.json({
      success: true,
      stats: { totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' },
      merchants: [],
      _debug: message,
    });
  }
}

// -------------------------------------------
// Pending merchants
// -------------------------------------------

async function getPendingMerchants() {
  try {
    const pendingUsers = await db.user.findMany({
      where: {
        accountStatus: 'pending',
        role: { notIn: ['buyer', 'admin'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    // If no pending users, return empty result immediately
    if (pendingUsers.length === 0) {
      return NextResponse.json({
        success: true,
        stats: { totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' },
        merchants: [],
      });
    }

    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const userIds = pendingUsers.map((u) => u.id);

    // Fetch verification records safely
    let storeVerifications: any[] = [];
    let freelancerVerifications: any[] = [];
    let supplierVerifications: any[] = [];
    let logisticsVerifications: any[] = [];

    try {
      storeVerifications = await db.storeVerification.findMany({ where: { userId: { in: userIds } } });
    } catch (e) { console.warn('storeVerification query failed:', e); }
    try {
      freelancerVerifications = await db.freelancerVerification.findMany({ where: { userId: { in: userIds } } });
    } catch (e) { console.warn('freelancerVerification query failed:', e); }
    try {
      supplierVerifications = await db.supplierVerification.findMany({ where: { userId: { in: userIds } } });
    } catch (e) { console.warn('supplierVerification query failed:', e); }
    try {
      logisticsVerifications = await db.logisticsVerification.findMany({ where: { userId: { in: userIds } } });
    } catch (e) { console.warn('logisticsVerification query failed:', e); }

    const storeVerMap = new Map(storeVerifications.map((v) => [v.userId, v]));
    const freeVerMap = new Map(freelancerVerifications.map((v) => [v.userId, v]));
    const supplierVerMap = new Map(supplierVerifications.map((v) => [v.userId, v]));
    const logisticsVerMap = new Map(logisticsVerifications.map((v) => [v.userId, v]));

    const merchants = pendingUsers.map((user) => {
      const registeredAt = user.createdAt.toISOString();
      const diff = now.getTime() - user.createdAt.getTime();
      const priority: 'urgent' | 'standard' = diff > oneDayMs ? 'urgent' : 'standard';

      const role = mapRole(user.role);

      const verRecord = storeVerMap.get(user.id) || freeVerMap.get(user.id) || supplierVerMap.get(user.id) || logisticsVerMap.get(user.id);

      let rejectionReason: string | undefined;
      if (verRecord) {
        if (verRecord.adminNotes) {
          rejectionReason = verRecord.adminNotes as string;
        } else if (verRecord.rejectionReasons) {
          try {
            const reasons = JSON.parse(verRecord.rejectionReasons as string);
            if (Array.isArray(reasons) && reasons.length > 0) {
              rejectionReason = reasons.join('، ');
            }
          } catch {
            rejectionReason = verRecord.rejectionReasons as string;
          }
        }
      }

      return {
        id: user.id,
        name: user.name,
        nameEn: user.nameEn || user.name,
        email: user.email,
        phone: user.phone || '',
        role,
        registeredAt,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        documents: [],
        verificationItems: [],
        priority,
        rejectionReason,
      };
    });

    // Compute stats safely
    let approvedToday = 0;
    let rejectedToday = 0;
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      approvedToday = await db.auditLog.count({ where: { action: 'approved', createdAt: { gte: todayStart } } });
      rejectedToday = await db.auditLog.count({ where: { action: 'rejected', createdAt: { gte: todayStart } } });
    } catch (e) { console.warn('Audit stats query failed:', e); }

    return NextResponse.json({
      success: true,
      stats: { totalPending: merchants.length, approvedToday, rejectedToday, avgReviewTime: '—' },
      merchants,
    });
  } catch (error) {
    console.error('[getPendingMerchants]', error);
    // Return empty result instead of crashing
    return NextResponse.json({
      success: true,
      stats: { totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' },
      merchants: [],
    });
  }
}

// -------------------------------------------
// Audit logs
// -------------------------------------------

async function getAuditLogs() {
  try {
    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, nameEn: true } },
      },
    });

    const actionLabels: Record<string, { labelAr: string; labelEn: string }> = {
      submitted: { labelAr: 'تقديم', labelEn: 'Submitted' },
      approved: { labelAr: 'تفعيل', labelEn: 'Approved' },
      rejected: { labelAr: 'رفض', labelEn: 'Rejected' },
      edited: { labelAr: 'تعديل', labelEn: 'Edited' },
      request_edit: { labelAr: 'طلب تعديل', labelEn: 'Request Edit' },
      login: { labelAr: 'تسجيل دخول', labelEn: 'Login' },
      logout: { labelAr: 'تسجيل خروج', labelEn: 'Logout' },
      note: { labelAr: 'ملاحظة', labelEn: 'Note' },
      role_change: { labelAr: 'تغيير دور', labelEn: 'Role Change' },
      suspend: { labelAr: 'تعليق', labelEn: 'Suspend' },
      activate: { labelAr: 'تفعيل', labelEn: 'Activate' },
      delete: { labelAr: 'حذف', labelEn: 'Delete' },
    };

    const mappedLogs = logs.map((log) => {
      const labels = actionLabels[log.action] || { labelAr: log.action, labelEn: log.action };
      let details = '';
      let detailsEn = '';

      if (log.details) {
        try {
          const d = JSON.parse(log.details);
          details = d.reason || d.note || d.message || '';
          detailsEn = d.reasonEn || d.noteEn || d.messageEn || details;
        } catch {
          details = log.details;
          detailsEn = log.details;
        }
      }

      return {
        id: log.id,
        merchantId: log.userId,
        merchantName: log.user.name,
        merchantNameEn: log.user.nameEn || log.user.name,
        adminName: log.adminId || 'النظام',
        action: log.action,
        actionLabelAr: labels.labelAr,
        actionLabelEn: labels.labelEn,
        details: details || `${labels.labelAr} - ${log.user.name}`,
        detailsEn: detailsEn || `${labels.labelEn} - ${log.user.nameEn || log.user.name}`,
        timestamp: log.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, auditLogs: mappedLogs });
  } catch (error) {
    console.error('[getAuditLogs]', error);
    // Return success with empty data instead of error
    return NextResponse.json({ success: true, auditLogs: [] });
  }
}

function mapRole(dbRole: string): 'store' | 'freelancer' | 'supplier' | 'logistics' {
  if (dbRole === 'store' || dbRole === 'store_manager') return 'store';
  if (dbRole === 'freelancer' || dbRole === 'seller') return 'freelancer';
  if (dbRole === 'supplier') return 'supplier';
  if (dbRole === 'logistics' || dbRole === 'delivery') return 'logistics';
  return 'freelancer';
}
