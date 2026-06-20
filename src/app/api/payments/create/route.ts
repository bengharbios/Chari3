import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PaymentOrchestrator } from '@/lib/payment-engine/core/PaymentOrchestrator';
import { ChargilyProvider } from '@/lib/payment-engine/plugins/chargily/ChargilyProvider';
import { SecurityService } from '@/lib/payment-engine/services/SecurityService';

// Initialize plugins
PaymentOrchestrator.registerPlugin(new ChargilyProvider());

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, gatewayId } = body;

    if (!orderId || !gatewayId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch Order and Seller
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { store: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Fetch Seller Payment Config
    const sellerConfig = await db.sellerPaymentConfig.findUnique({
      where: { sellerId: order.store.sellerId }
    });

    // 3. Fallback to global config if platform mode
    let paymentConfig: any = {};
    
    if (sellerConfig && sellerConfig.mode === 'split' || sellerConfig?.mode === 'direct') {
      paymentConfig = SecurityService.decryptConfig(sellerConfig.encryptedKeys);
    } else {
      // Platform collect mode (centralized)
      const globalConfig = await db.paymentProvider.findUnique({
        where: { id: gatewayId }
      });
      if (globalConfig) {
        paymentConfig = JSON.parse(globalConfig.configSchema);
      } else {
        throw new Error('Global payment config not found');
      }
    }

    // 4. Create Payment Session
    const session = await PaymentOrchestrator.createPayment(
      gatewayId,
      order.total,
      'dzd',
      order.orderNumber,
      paymentConfig,
      { 
        sellerId: order.store.sellerId,
        paymentMode: sellerConfig?.mode || 'platform'
      }
    );

    // Update order with payment session id
    await db.order.update({
      where: { id: orderId },
      data: { paymentSessionId: session.id }
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error('[PaymentAPI] Error:', error);
    return NextResponse.json({ error: error.message || 'Payment processing failed' }, { status: 500 });
  }
}
