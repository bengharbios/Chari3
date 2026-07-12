import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/better-auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

// POST /api/admin/upgrade-requests/reject
// Rejects upgrade request documents (Pending -> Rejected) OR rejects payment receipt (Payment Submitted -> Awaiting Payment)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, rejectionNote } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const upgradeRequest = await db.upgradeRequest.findFirst({
      where: { userId: userId, isActive: true }
    });

    if (!upgradeRequest) {
      return NextResponse.json({ success: false, error: 'No active upgrade request found for this user' }, { status: 404 });
    }

    // CASE 1: Rejecting Payment Receipt (PAYMENT_SUBMITTED -> AWAITING_PAYMENT)
    if (upgradeRequest.status === 'PAYMENT_SUBMITTED') {
      await db.$transaction(async (tx) => {
        // Roll request back to AWAITING_PAYMENT
        await tx.upgradeRequest.update({
          where: { id: upgradeRequest.id },
          data: {
            status: 'AWAITING_PAYMENT',
            paymentRejectionReason: rejectionNote || 'وصل الدفع غير صحيح أو غير واضح.',
            reviewedBy: session.user.id,
            reviewedAt: new Date()
          }
        });

        // Notify user about payment rejection
        await tx.notification.create({
          data: {
            userId: user.id,
            type: 'UPGRADE_PAYMENT_REJECTED',
            title: 'تم رفض وصل سداد ترقية الحساب',
            titleEn: 'Upgrade Payment Receipt Rejected',
            body: `تم رفض وصل الدفع الخاص بك. السبب: ${rejectionNote || 'وصل الدفع غير مقروء أو غير صحيح'}. يرجى إرفاق وصل صحيح لتفعيل الترقية.`,
            bodyEn: `Your payment receipt was rejected. Reason: ${rejectionNote || 'Invalid or unreadable receipt'}. Please upload a valid receipt.`,
          }
        });
      });

      return NextResponse.json({ success: true, message: 'Payment receipt rejected. Status rolled back to awaiting payment.' });
    }

    // CASE 2: Rejecting Documents (PENDING -> REJECTED)
    if (upgradeRequest.status === 'PENDING') {
      await db.$transaction(async (tx) => {
        if (user.sellerProfile) {
          await tx.sellerProfile.update({
            where: { id: user.sellerProfile.id },
            data: { wantsUpgrade: false, upgradeRequestedAt: null }
          });
        }

        // Set request status to REJECTED
        await tx.upgradeRequest.update({
          where: { id: upgradeRequest.id },
          data: {
            status: 'REJECTED',
            rejectionReason: rejectionNote || 'المستندات المرفقة غير مكتملة أو غير صالحة.',
            reviewedBy: session.user.id,
            reviewedAt: new Date()
          }
        });

        // Notify user about document rejection
        await tx.notification.create({
          data: {
            userId: user.id,
            type: 'UPGRADE_DOCS_REJECTED',
            title: 'تم رفض طلب ترقية الحساب',
            titleEn: 'Business Upgrade Request Rejected',
            body: `نأسف، تم رفض طلب ترقية حسابك للأعمال. السبب: ${rejectionNote || 'المستندات غير واضحة أو غير مكتملة'}. يمكنك تقديم طلب جديد بعد تصحيح المستندات.`,
            bodyEn: `Your business upgrade request was rejected. Reason: ${rejectionNote || 'Incomplete or invalid documents'}. You can apply again with correct details.`,
          }
        });
      });

      return NextResponse.json({ success: true, message: 'Documents rejected. Upgrade request deactivated.' });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Upgrade request is in an invalid status for rejection.' 
    }, { status: 400 });

  } catch (error: any) {
    console.error('[POST /api/admin/upgrade-requests/reject] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
