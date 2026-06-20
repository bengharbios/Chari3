import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySignature } from '@chargily/chargily-pay';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
    }

    const payloadString = await req.text();
    let event: any;
    try {
      event = JSON.parse(payloadString);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Since this is a webhook, we need to know WHICH secret key to use to verify.
    // We can try to extract the order ID from the payload BEFORE verifying,
    // just to figure out which seller this belongs to.
    // This is safe because even if it's forged, verification will fail if the secret key doesn't match.
    const orderId = event?.data?.metadata?.order_id;
    
    if (!orderId) {
      return NextResponse.json({ error: 'No order_id in metadata' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch payment settings to get the correct Secret Key
    const sysSetting = await db.systemSetting.findUnique({ where: { key: 'platform_payment_model' } });
    const paymentModel = sysSetting?.value || 'mixed';

    const globalMethod = await db.globalPaymentMethod.findFirst({
      where: { type: 'chargily_pay', isActive: true }
    });

    let globalConfig: any = {};
    if (globalMethod?.configSchema) {
      try { globalConfig = JSON.parse(globalMethod.configSchema); } catch (e) {}
    }

    let storeConfig: any = {};
    const firstItem = order.items[0];
    if (firstItem) {
      const product = await db.product.findUnique({ where: { id: firstItem.productId } });
      if (product?.storeId) {
        const store = await db.store.findUnique({ where: { id: product.storeId } });
        if (store?.paymentDetails) {
          try { storeConfig = JSON.parse(store.paymentDetails); } catch (e) {}
        }
      } else if (product?.sellerId) {
        const seller = await db.sellerProfile.findUnique({ where: { id: product.sellerId } });
        if (seller?.paymentDetails) {
          try { storeConfig = JSON.parse(seller.paymentDetails); } catch (e) {}
        }
      }
    }

    let secretKey = '';
    if (paymentModel === 'decentralized' && storeConfig?.chargilySecretKey) {
      secretKey = storeConfig.chargilySecretKey;
    } else if (paymentModel === 'mixed') {
      secretKey = storeConfig?.chargilySecretKey || globalConfig?.secretKey;
    } else {
      secretKey = globalConfig?.secretKey;
    }

    if (!secretKey) {
      return NextResponse.json({ error: 'Chargily is not configured' }, { status: 400 });
    }

    // Now verify the signature
    if (!verifySignature(payloadString, signature, secretKey)) {
      console.error('Chargily Webhook: Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Process the event
    if (event.type === 'checkout.paid') {
      // Mark order as paid
      await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'paid' }
      });

      // Add to order history
      await db.orderStatusHistory.create({
        data: {
          orderId: orderId,
          status: order.status, // keep current status
          note: 'تم الدفع بنجاح عبر بوابة Chargily Pay (البطاقة الذهبية/CIB)'
        }
      });
      
      console.log(`Order ${orderId} marked as paid via Chargily`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Chargily Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
