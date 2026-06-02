import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAndEnforceDebtLimit } from '@/lib/billing';

export const dynamic = 'force-dynamic';

// GET /api/billing/receipts — List bank transfer receipts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // pending, approved, rejected

    const where: Record<string, any> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const receipts = await db.debtPaymentReceipt.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, receipts });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/billing/receipts — Merchant uploads receipt
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, receiptImage, merchantNote } = body;

    if (!userId || !amount || !receiptImage) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const receipt = await db.debtPaymentReceipt.create({
      data: {
        userId,
        amount: parseFloat(amount),
        receiptImage,
        merchantNote: merchantNote || '',
        status: 'pending',
      },
    });

    // Notify administrators of a new manual payment receipt submission
    try {
      const admins = await db.user.findMany({
        where: { role: 'admin' },
        select: { id: true },
      });
      for (const admin of admins) {
        await db.notification.create({
          data: {
            userId: admin.id,
            title: 'وصل دفع جديد بانتظار التأكيد 🧾',
            titleEn: 'New Payment Receipt Awaiting Approval 🧾',
            body: `قام التاجر بإرسال وصل تحويل بقيمة ${parseFloat(amount).toLocaleString()} دج للمراجعة.`,
            bodyEn: `A merchant submitted a transfer slip of ${parseFloat(amount).toLocaleString()} DZD for approval.`,
            type: 'admin_action',
            data: JSON.stringify({ receiptId: receipt.id }),
          },
        });
      }
    } catch (notifErr) {
      console.error('[Notification error]', notifErr);
    }

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PATCH /api/billing/receipts — Admin reviews receipt (approve/reject)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { receiptId, status, adminNote, adminId } = body;

    if (!receiptId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Missing or invalid parameters' }, { status: 400 });
    }

    const receipt = await db.debtPaymentReceipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      return NextResponse.json({ success: false, error: 'Receipt not found' }, { status: 404 });
    }

    if (receipt.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Receipt is already processed' }, { status: 400 });
    }

    // Process approval/rejection
    const updatedReceipt = await db.debtPaymentReceipt.update({
      where: { id: receiptId },
      data: {
        status,
        adminNote,
        reviewedAt: new Date(),
        reviewedBy: adminId || null,
      },
    });

    if (status === 'approved') {
      // Credit wallet
      let wallet = await db.wallet.findUnique({
        where: { userId: receipt.userId },
      });
      if (!wallet) {
        wallet = await db.wallet.create({
          data: { userId: receipt.userId, balance: 0 },
        });
      }

      const newBalance = wallet.balance + receipt.amount;

      // Create ledger transaction
      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBT_CLEARANCE',
          amount: receipt.amount,
          balance: newBalance,
          description: `تأكيد تسديد المديونية يدوياً (CCP/BaridiMob) - إيصال رقم #${receiptId}`,
          referenceId: receiptId,
        },
      });

      // Update wallet balance
      await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          totalEarned: wallet.totalEarned + receipt.amount,
        },
      });

      // Re-evaluate debt limits (reactivates merchant if they rise above limit)
      await checkAndEnforceDebtLimit(receipt.userId, newBalance);

      // Notify merchant of approval
      try {
        await db.notification.create({
          data: {
            userId: receipt.userId,
            title: 'تم تأكيد وصل الدفع بنجاح! 🎉',
            titleEn: 'Payment Receipt Approved! 🎉',
            body: `تم إيداع ${receipt.amount.toLocaleString()} دج في حسابك لتسديد مديونيتك. تم تفعيل متجرك/حسابك.`,
            bodyEn: `Deposited ${receipt.amount.toLocaleString()} DZD into your wallet. Your store is now active.`,
            type: 'billing',
            data: JSON.stringify({ receiptId: receipt.id, status: 'approved' }),
          },
        });
      } catch (notifErr) {
        console.error('[Notification error]', notifErr);
      }
    } else {
      // Notify merchant of rejection
      try {
        await db.notification.create({
          data: {
            userId: receipt.userId,
            title: 'تم رفض وصل الدفع ❌',
            titleEn: 'Payment Receipt Rejected ❌',
            body: `تم رفض إيصال الدفع بقيمة ${receipt.amount.toLocaleString()} دج. السبب: ${adminNote || 'غير محدد'}. يرجى التحقق وإعادة الإرسال.`,
            bodyEn: `Your payment receipt of ${receipt.amount.toLocaleString()} DZD was rejected. Reason: ${adminNote || 'Not specified'}.`,
            type: 'billing',
            data: JSON.stringify({ receiptId: receipt.id, status: 'rejected' }),
          },
        });
      } catch (notifErr) {
        console.error('[Notification error]', notifErr);
      }
    }

    return NextResponse.json({ success: true, receipt: updatedReceipt });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
