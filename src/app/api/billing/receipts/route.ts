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
    const { userId, amount, receiptImage, merchantNote, invoiceId } = body;

    if (!userId || !amount || !receiptImage) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Prevent sending another receipt if one is already pending
    const pendingReceipt = await db.debtPaymentReceipt.findFirst({
      where: { userId, status: 'pending' },
    });

    if (pendingReceipt) {
      return NextResponse.json({
        success: false,
        error: 'لديك وصل قيد المراجعة حالياً، يرجى انتظار الرد عليه قبل إرسال وصل آخر.',
        errorEn: 'You already have a pending receipt. Please wait for its approval.'
      }, { status: 400 });
    }

    const receipt = await db.debtPaymentReceipt.create({
      data: {
        userId,
        amount: parseFloat(amount),
        receiptImage,
        merchantNote: merchantNote || '',
        status: 'pending',
        invoiceId: invoiceId || null,
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
      let wallet = await db.wallet.findUnique({
        where: { userId: receipt.userId },
      });
      if (!wallet) {
        wallet = await db.wallet.create({
          data: { userId: receipt.userId, balance: 0, debt: 0 },
        });
      }

      const receiptAmount = receipt.amount;
      let newDebt = wallet.debt;
      let newBalance = wallet.balance;

      // 1. Pay off debt first
      if (newDebt > 0) {
        if (receiptAmount >= newDebt) {
          const remaining = receiptAmount - newDebt;
          newDebt = 0;
          newBalance += remaining;
        } else {
          newDebt -= receiptAmount;
        }
      } else {
        newBalance += receiptAmount;
      }

      // 2. Create ledger transaction
      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: receipt.invoiceId ? 'SUBSCRIPTION_PAYMENT_RECEIPT' : 'DEBT_CLEARANCE',
          amount: receipt.amount,
          balance: newBalance,
          description: `تأكيد وصل دفع יدوياً - إيصال رقم #${receiptId}`,
          referenceId: receiptId,
        },
      });

      // 3. Update wallet balance and debt
      await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          debt: newDebt,
          totalEarned: wallet.totalEarned + receipt.amount,
        },
      });

      // 4. Activate Subscription if invoice is attached
      let subscriptionActivated = false;
      if (receipt.invoiceId) {
        const invoice = await db.invoice.findUnique({
          where: { id: receipt.invoiceId },
          include: { subscription: true }
        });

        if (invoice && invoice.status !== 'PAID') {
          await db.invoice.update({
            where: { id: invoice.id },
            data: { status: 'PAID', amountPaid: receipt.amount, paidAt: new Date() }
          });
          
          if (invoice.subscriptionId && invoice.subscription?.status === 'PENDING_APPROVAL') {
            await db.subscription.update({
              where: { id: invoice.subscriptionId },
              data: { status: 'ACTIVE' }
            });
            await db.subscription.updateMany({
              where: {
                userId: invoice.userId,
                id: { not: invoice.subscriptionId },
                status: { in: ['ACTIVE', 'TRIAL'] }
              },
              data: { status: 'EXPIRED', cancelReason: 'تفعيل اشتراك عبر الإيصال' }
            });
            subscriptionActivated = true;
            // Charge the wallet for the subscription amount since we credited it from the receipt
            if (newBalance >= invoice.amount) {
              newBalance -= invoice.amount;
            } else {
              newDebt += (invoice.amount - newBalance);
              newBalance = 0;
            }
            await db.wallet.update({
              where: { id: wallet.id },
              data: { balance: newBalance, debt: newDebt, totalSpent: wallet.totalSpent + invoice.amount }
            });
            await db.walletTransaction.create({
              data: {
                walletId: wallet.id,
                type: 'SUBSCRIPTION_DEDUCTION',
                amount: -invoice.amount,
                balance: newBalance,
                description: `خصم قيمة الاشتراك من الإيصال - فاتورة #${invoice.id}`,
                referenceId: invoice.id,
              },
            });
          }
        }
      }

      // Re-evaluate debt limits
      await checkAndEnforceDebtLimit(receipt.userId, newBalance, newDebt);

      // Notify merchant of approval
      try {
        await db.notification.create({
          data: {
            userId: receipt.userId,
            title: subscriptionActivated ? 'تم تفعيل اشتراكك بنجاح! 🎉' : 'تم تأكيد وصل الدفع بنجاح! 🎉',
            titleEn: subscriptionActivated ? 'Subscription Activated! 🎉' : 'Payment Receipt Approved! 🎉',
            body: subscriptionActivated 
              ? `تم مراجعة إيصالك وتفعيل اشتراكك بنجاح في المنصة.` 
              : `تم إيداع ${receipt.amount.toLocaleString()} دج في حسابك / تسديد مديونيتك.`,
            bodyEn: subscriptionActivated 
              ? `Your receipt was approved and your subscription is active.` 
              : `Deposited ${receipt.amount.toLocaleString()} DZD / cleared your debt.`,
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
