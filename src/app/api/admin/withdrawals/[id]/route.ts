import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureDbConnection();
    const id = params.id;
    const body = await req.json();
    const { status, adminNote, adminId } = body; // status can be 'approved', 'paid', 'rejected'

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const request = await db.withdrawalRequest.findUnique({
      where: { id },
      include: { seller: { select: { userId: true } } }
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Withdrawal request not found' }, { status: 404 });
    }

    if (request.status === 'paid' || request.status === 'rejected') {
      return NextResponse.json({ success: false, error: 'Request is already finalized' }, { status: 400 });
    }

    // Process payment if status is 'paid'
    if (status === 'paid') {
      const wallet = await db.wallet.findUnique({ where: { userId: request.seller.userId } });
      if (!wallet) {
        return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
      }

      if (wallet.balance < request.amount) {
        return NextResponse.json({ success: false, error: 'Insufficient wallet balance for this payout' }, { status: 400 });
      }

      // Start a transaction to ensure atomic update
      await db.$transaction(async (tx) => {
        // 1. Deduct from wallet
        await tx.wallet.update({
          where: { userId: request.seller.userId },
          data: { 
            balance: { decrement: request.amount },
            totalSpent: { increment: request.amount }
          }
        });

        // 2. Add wallet transaction log
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'WITHDRAWAL',
            amount: -request.amount,
            balance: wallet.balance - request.amount,
            description: `سحب أرباح (${request.method})`,
            referenceId: request.id,
          }
        });

        // 3. Update withdrawal request
        await tx.withdrawalRequest.update({
          where: { id },
          data: {
            status: 'paid',
            adminNote: adminNote || request.adminNote,
            processedAt: new Date(),
          }
        });

        // 4. Log admin action
        if (adminId) {
          await tx.adminAuditLog.create({
            data: {
              adminId,
              action: 'APPROVE_WITHDRAWAL',
              targetId: id,
              details: JSON.stringify({ amount: request.amount, method: request.method }),
            }
          });
        }
      });

    } else {
      // Just update status to rejected or approved (not paid yet)
      await db.withdrawalRequest.update({
        where: { id },
        data: {
          status,
          adminNote: adminNote || request.adminNote,
          processedAt: status === 'rejected' ? new Date() : null,
        }
      });
      
      // 4. Log admin action
      if (adminId) {
        await db.adminAuditLog.create({
          data: {
            adminId,
            action: `MARK_WITHDRAWAL_${status.toUpperCase()}`,
            targetId: id,
            details: JSON.stringify({ adminNote }),
          }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    console.error('[admin/withdrawals/[id] PATCH]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
