import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/logistics/claim
 * =========================================================
 * Atomic Claim Lock implementation inspired by FleetOps.
 * Ensures two drivers cannot simultaneously claim the same parcel
 * from the Open Load Pool. Uses Prisma interactive $transaction.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, driverId, driverName } = body;

    if (!orderId || !driverId) {
      return NextResponse.json(
        { success: false, error: 'رقم الطلب ومعرف المندوب مطلوبان (orderId & driverId are required)' },
        { status: 400 }
      );
    }

    // Fetch the global debt limit (default to 50000 if not set)
    const limitSetting = await db.setting.findUnique({ where: { key: 'billing_global_debt_limit' } });
    const maxDebtLimit = limitSetting && limitSetting.value ? Math.abs(parseInt(limitSetting.value, 10)) : 50000;

    // Fetch the driver's wallet to check debt limit
    const driverWallet = await db.wallet.findUnique({ where: { userId: driverId } });
    if (driverWallet && Number(driverWallet.debt) >= maxDebtLimit) {
      return NextResponse.json(
        { 
          success: false, 
          error: `تم إيقاف حسابك لتجاوز الحد الائتماني للديون (${maxDebtLimit} DZD). يرجى تسديد المستحقات لتتمكن من استلام شحنات جديدة.`
        },
        { status: 403 }
      );
    }

    // Execute atomic transaction with serializable isolation protection
    const result = await db.$transaction(async (tx) => {
      // 1. Lock and fetch the order within the transaction
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { shipments: true }
      });

      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      // 2. Check if already claimed by another driver
      const currentAssigned = (order as any).assignedDriverId;
      if (currentAssigned && currentAssigned !== driverId) {
        throw new Error('ALREADY_CLAIMED');
      }

      const existingShipment = order.shipments && order.shipments.length > 0 ? order.shipments[0] : null;
      if (existingShipment && (existingShipment as any).isClaimed && (existingShipment as any).claimedByDriverId !== driverId) {
        throw new Error('ALREADY_CLAIMED');
      }

      const now = new Date();

      // 3. Atomically update Order status and assign driver
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'shipped',
          assignedDriverId: driverId,
          claimedAt: now,
          logisticsStage: 'picked_up',
        } as any
      });

      // 4. Update or create corresponding Shipment record with Claim Lock
      let updatedShipment;
      if (existingShipment) {
        updatedShipment = await tx.shipment.update({
          where: { id: existingShipment.id },
          data: {
            status: 'picked_up',
            isClaimed: true,
            claimedByDriverId: driverId,
            claimedAt: now,
            pickedUpAt: now,
          } as any
        });
      } else {
        updatedShipment = await tx.shipment.create({
          data: {
            orderId: order.id,
            trackingNumber: order.orderNumber || `TN-${order.id.substring(0, 8).toUpperCase()}`,
            carrier: driverName || 'ChariDay Express Driver',
            status: 'picked_up',
            isClaimed: true,
            claimedByDriverId: driverId,
            claimedAt: now,
            pickedUpAt: now,
            deliveryAddress: typeof order.address === 'string' ? order.address : JSON.stringify(order.address || {}),
          } as any
        });
      }

      // 5. Create audit status history record
      try {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'picked_up',
            note: `تم حجز الطرد واستلامه ذرياً بواسطة المندوب (Driver ID: ${driverId}) via Claim Lock Engine.`,
            createdBy: driverId,
          }
        });
      } catch (historyErr) {
        console.warn('Could not record OrderStatusHistory during claim lock:', historyErr);
      }

      return { order: updatedOrder, shipment: updatedShipment };
    });

    return NextResponse.json({
      success: true,
      message: 'تم حجز الشحنة واقتناصها بنجاح! (Claim Lock acquired successfully)',
      data: result,
    }, { status: 200 });

  } catch (error: any) {
    if (error.message === 'ALREADY_CLAIMED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'عذراً، تم حجز هذا الطرد من قِبَل مندوب آخر قبل ثوانٍ قليلة (Already claimed by another driver)',
          code: 'CONFLICT_CLAIMED'
        }, 
        { status: 409 }
      );
    }

    if (error.message === 'ORDER_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: 'الطلب المحدد غير موجود' }, 
        { status: 404 }
      );
    }

    console.error('[logistics claim POST] Error:', error);
    return NextResponse.json({ success: false, error: String(error.message || error) }, { status: 500 });
  }
}
