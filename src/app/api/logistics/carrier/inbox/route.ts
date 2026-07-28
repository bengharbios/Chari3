import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toUniversalStatus } from '@/lib/logistics/carrier-status-map';

export const dynamic = 'force-dynamic';

/**
 * GET /api/logistics/carrier/inbox
 * =========================================================
 * Carrier Inbox and Packing Queue.
 * Returns orders assigned to a 3PL carrier company where
 * fulfillmentType === 'carrier' waiting for carrier packaging,
 * weighing, and label generation.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const carrierKey = searchParams.get('carrierKey') || searchParams.get('carrierId');

    // Query confirmed or processing orders targeted for carrier fulfillment
    const rawOrders = await db.order.findMany({
      where: {
        status: { in: ['confirmed', 'processing'] },
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { name: true, phone: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } }
          }
        }
      }
    });

    // Filter by fulfillmentType and assigned carrier if specified
    const carrierOrders = rawOrders.filter((o: any) => {
      const isCarrierType = o.fulfillmentType === 'carrier' || !o.fulfillmentType; // default inclusion for demo if needed
      if (carrierKey && carrierKey !== 'all') {
        return isCarrierType && (o.assignedCarrierId === carrierKey || o.assignedCarrierId === 'yalidine');
      }
      return o.fulfillmentType === 'carrier';
    });

    // Format for carrier packing station
    const queueItems = carrierOrders.map((o) => {
      let rawAddr: any = o.address;
      if (typeof rawAddr === 'string' && rawAddr.startsWith('{')) {
        try { rawAddr = JSON.parse(rawAddr); } catch (e) {}
      }

      const stage = (o as any).logisticsStage || 'ready_for_carrier';

      return {
        id: o.id,
        orderId: o.id,
        trackingNumber: o.orderNumber || `CR-${o.id.substring(0, 8).toUpperCase()}`,
        recipientName: (typeof rawAddr === 'object' && rawAddr?.fullName) ? rawAddr.fullName : (o.buyer?.name || 'زائر'),
        phone: (typeof rawAddr === 'object' && rawAddr?.phone) ? rawAddr.phone : (o.buyer?.phone || '0550000000'),
        city: (typeof rawAddr === 'object' && (rawAddr?.city || rawAddr?.state)) ? (rawAddr.city || rawAddr.state) : 'الجزائر',
        address: (typeof rawAddr === 'object' && rawAddr?.street) ? rawAddr.street : (typeof o.address === 'string' ? o.address : 'غير محدد'),
        codAmount: o.total || 0,
        shippingFee: o.shippingCost || 400,
        status: o.status,
        logisticsStage: stage,
        universalStatus: toUniversalStatus((o as any).assignedCarrierId || 'yalidine', 'PREPARATION'),
        assignedCarrierId: (o as any).assignedCarrierId || 'yalidine',
        items: o.items.map(i => ({
          id: i.id,
          name: i.productName || i.product?.name || 'منتج تجزئة',
          quantity: i.quantity,
          sku: i.product?.sku || `SKU-${i.id.substring(0, 5)}`,
        })),
        createdAt: o.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      count: queueItems.length,
      data: queueItems,
    });

  } catch (error: any) {
    console.error('[carrier inbox GET] Error:', error);
    return NextResponse.json({ success: false, error: String(error.message || error) }, { status: 500 });
  }
}

/**
 * PATCH /api/logistics/carrier/inbox
 * =========================================================
 * Updates carrier packaging stage (weighing & label issuance).
 * When action === 'confirm_ready', transitions logisticsStage
 * to 'ready_for_pickup' to publish to Open Load Pool / dispatch drivers.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action, weight, barcode } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, error: 'معرف الطلب والإجراء مطلوبان (orderId & action required)' },
        { status: 400 }
      );
    }

    let newStage = 'carrier_packing';
    let newStatus = 'processing';
    let noteText = 'بدأت شركة الشحن عملية التغليف وحساب الوزن.';

    if (action === 'confirm_ready') {
      newStage = 'ready_for_pickup';
      newStatus = 'confirmed';
      noteText = `اكتمل تغليف شركة الشحن (الوزن: ${weight || '1.2'} كغ - الباركود: ${barcode || 'CR-READY'}). الطرد الآن في سوق الشحن المفتوح للمناديب.`;
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        logisticsStage: newStage,
      } as any
    });

    try {
      await db.orderStatusHistory.create({
        data: {
          orderId,
          status: newStage,
          note: noteText,
        }
      });
    } catch (e) {
      console.warn('Could not add history item in carrier inbox patch:', e);
    }

    return NextResponse.json({
      success: true,
      message: action === 'confirm_ready' 
        ? 'تم ترحيل الطرد إلى سوق الشحن المفتوح بنجاح (Ready for driver pickup)!' 
        : 'تم البدء بتغليف الطرد بنجاح!',
      order: updatedOrder,
    });

  } catch (error: any) {
    console.error('[carrier inbox PATCH] Error:', error);
    return NextResponse.json({ success: false, error: String(error.message || error) }, { status: 500 });
  }
}
