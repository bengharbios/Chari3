import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CRITICAL_ACTION_TYPES, CRITICAL_ACTION_LABELS, type CriticalActionType } from '@/lib/admin-guards';

export const dynamic = 'force-dynamic';

// ============================================
// GET /api/admin/critical-actions?status=pending|all
// List critical actions pending approval
// ============================================
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') || 'pending';
    const requesterId = req.nextUrl.searchParams.get('requesterId'); // To exclude own requests

    const where: any = status === 'all' ? {} : { status };

    const actions = await db.pendingCriticalAction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Enrich with user info
    const enriched = await Promise.all(
      actions.map(async (action) => {
        const [creator, approver] = await Promise.all([
          db.user.findUnique({
            where: { id: action.createdBy },
            select: { id: true, name: true, nameEn: true, email: true, role: true },
          }),
          action.approvedBy
            ? db.user.findUnique({
                where: { id: action.approvedBy },
                select: { id: true, name: true, nameEn: true, email: true },
              })
            : null,
        ]);

        const label = CRITICAL_ACTION_LABELS[action.actionType as CriticalActionType];
        let payload: any = {};
        try { payload = JSON.parse(action.payload); } catch { /* noop */ }

        return {
          ...action,
          payload,
          creator,
          approver,
          labelAr: label?.ar || action.actionType,
          labelEn: label?.en || action.actionType,
          canApprove: requesterId && requesterId !== action.createdBy, // Can't approve your own
        };
      })
    );

    return NextResponse.json({ success: true, actions: enriched });
  } catch (err) {
    console.error('[GET /api/admin/critical-actions]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// ============================================
// POST /api/admin/critical-actions
// Submit a new critical action for approval
// Body: { actionType, payload, createdBy, isSuperAdmin? }
// ============================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType, payload, createdBy, isSuperAdmin } = body;

    if (!actionType || !createdBy) {
      return NextResponse.json({ success: false, error: 'actionType and createdBy are required' }, { status: 400 });
    }

    if (!CRITICAL_ACTION_TYPES.includes(actionType)) {
      return NextResponse.json({ success: false, error: `Unknown action type: ${actionType}` }, { status: 400 });
    }

    // SUPER_ADMIN bypass — executes immediately without needing approval
    if (isSuperAdmin) {
      // Create with auto-approval
      const action = await db.pendingCriticalAction.create({
        data: {
          actionType,
          payload: JSON.stringify(payload || {}),
          createdBy,
          approvedBy: createdBy,
          status: 'approved',
        },
      });
      return NextResponse.json({
        success: true,
        action,
        immediateExecution: true,
        message: 'تم التنفيذ مباشرة (SUPER_ADMIN)',
      });
    }

    // Regular admin — create pending action
    const action = await db.pendingCriticalAction.create({
      data: {
        actionType,
        payload: JSON.stringify(payload || {}),
        createdBy,
        status: 'pending',
      },
    });

    // Log to audit
    await db.auditLog.create({
      data: {
        userId: createdBy,
        adminId: createdBy,
        action: 'critical_action_requested',
        details: JSON.stringify({ actionType, payload, actionId: action.id }),
      },
    });

    return NextResponse.json({
      success: true,
      action,
      immediateExecution: false,
      message: 'تم إرسال الإجراء لموافقة مدير آخر',
      messageEn: 'Action submitted for approval by another admin',
    });
  } catch (err) {
    console.error('[POST /api/admin/critical-actions]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// ============================================
// PATCH /api/admin/critical-actions
// Approve or reject a pending action
// Body: { actionId, approverId, decision: 'approve'|'reject', note? }
// ============================================
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionId, approverId, decision, note } = body;

    if (!actionId || !approverId || !decision) {
      return NextResponse.json({ success: false, error: 'actionId, approverId, and decision are required' }, { status: 400 });
    }

    const action = await db.pendingCriticalAction.findUnique({ where: { id: actionId } });
    if (!action) return NextResponse.json({ success: false, error: 'Action not found' }, { status: 404 });

    if (action.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'هذا الإجراء تمت معالجته بالفعل', errorEn: 'This action has already been processed' },
        { status: 400 }
      );
    }

    // Self-approval prevention
    if (action.createdBy === approverId) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكنك الموافقة على إجراء طلبته أنت',
          errorEn: 'You cannot approve an action you requested',
        },
        { status: 403 }
      );
    }

    // Verify approver is an admin
    const approver = await db.user.findUnique({
      where: { id: approverId },
      select: { id: true, role: true, name: true },
    });

    if (!approver || !['admin', 'super_admin'].includes(approver.role)) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية الموافقة على هذا الإجراء', errorEn: 'Insufficient permissions to approve' },
        { status: 403 }
      );
    }

    const newStatus = decision === 'approve' ? 'approved' : 'rejected';

    const updated = await db.pendingCriticalAction.update({
      where: { id: actionId },
      data: {
        status: newStatus,
        approvedBy: approverId,
        ...(note ? { payload: JSON.stringify({ ...JSON.parse(action.payload || '{}'), _adminNote: note }) } : {}),
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: action.createdBy,
        adminId: approverId,
        action: `critical_action_${newStatus}`,
        details: JSON.stringify({
          actionId,
          actionType: action.actionType,
          decision,
          approverName: approver.name,
          note: note || null,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      action: updated,
      message: newStatus === 'approved'
        ? 'تمت الموافقة على الإجراء وسيُنفَّذ الآن'
        : 'تم رفض الإجراء',
    });
  } catch (err) {
    console.error('[PATCH /api/admin/critical-actions]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
