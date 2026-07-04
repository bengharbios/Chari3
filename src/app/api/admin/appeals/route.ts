import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/appeals  — list all appeals for admin review
export async function GET(req: NextRequest) {
  try {
    const statusFilter = req.nextUrl.searchParams.get('status') || 'pending';

    const appeals = await db.suspensionAppeal.findMany({
      where: statusFilter === 'all' ? {} : { status: statusFilter },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            email: true,
            role: true,
            accountStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, appeals });
  } catch (err) {
    console.error('[GET /api/admin/appeals]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// PATCH /api/admin/appeals  — approve or reject an appeal
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { appealId, action, adminNote } = body; // action: 'approve' | 'reject'

    if (!appealId || !action) {
      return NextResponse.json({ success: false, error: 'appealId and action required' }, { status: 400 });
    }

    const appeal = await db.suspensionAppeal.findUnique({ where: { id: appealId } });
    if (!appeal) return NextResponse.json({ success: false, error: 'Appeal not found' }, { status: 404 });

    // Update appeal status
    const updatedAppeal = await db.suspensionAppeal.update({
      where: { id: appealId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNote: adminNote || null,
      },
    });

    // If approved: reactivate user account
    if (action === 'approve') {
      await db.user.update({
        where: { id: appeal.userId },
        data: { accountStatus: 'active', isActive: true },
      });

      // Also unsuspend their subscription if suspended
      await db.subscription.updateMany({
        where: { userId: appeal.userId, status: 'SUSPENDED' },
        data: { status: 'ACTIVE' },
      });
    }

    return NextResponse.json({ success: true, appeal: updatedAppeal });
  } catch (err) {
    console.error('[PATCH /api/admin/appeals]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
