import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PaymentOrchestrator } from '@/lib/payment-engine/core/PaymentOrchestrator';
import { ChargilyProvider } from '@/lib/payment-engine/plugins/chargily/ChargilyProvider';
import { SecurityService } from '@/lib/payment-engine/services/SecurityService';
import { SettlementEngine } from '@/lib/payment-engine/core/SettlementEngine';
import crypto from 'crypto';

// Initialize plugins
PaymentOrchestrator.registerPlugin(new ChargilyProvider());

export async function POST(req: Request, { params }: { params: { gatewayId: string } }) {
  try {
    const { gatewayId } = params;
    const bodyText = await req.text();
    const signature = req.headers.get('signature') || req.headers.get('x-signature') || req.headers.get('stripe-signature') || '';

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);

    // To verify, we need the correct config. We must find the order/transaction first.
    // In Chargily, metadata contains order_id. We parse it temporarily to find the config.
    let orderId = '';
    if (gatewayId === 'chargily' && payload.data?.metadata) {
      const m = payload.data.metadata.find((x: any) => x.order_id);
      if (m) orderId = m.order_id;
    }

    if (!orderId) {
      // If we can't find orderId in payload, we might have to fallback to checking all configs 
      // or assume it's platform config. For this demo, we assume platform config if no orderId.
      throw new Error('Order ID not found in webhook payload');
    }

    // Fetch order to know the seller
    const order = await db.order.findUnique({
      where: { orderNumber: orderId },
      include: { store: true }
    });

    if (!order) throw new Error('Order not found');

    const sellerConfig = await db.sellerPaymentConfig.findUnique({
      where: { sellerId: order.store.sellerId }
    });

    let paymentConfig: any = {};
    if (sellerConfig && (sellerConfig.mode === 'split' || sellerConfig.mode === 'direct')) {
      paymentConfig = SecurityService.decryptConfig(sellerConfig.encryptedKeys);
    } else {
      const globalConfig = await db.paymentProvider.findUnique({
        where: { id: gatewayId }
      });
      if (globalConfig) {
        paymentConfig = JSON.parse(globalConfig.configSchema);
      } else {
        throw new Error('Global config not found');
      }
    }

    // Process webhook using orchestrator
    const event = await PaymentOrchestrator.handleWebhook(gatewayId, payload, signature, paymentConfig);

    if (event.type === 'payment.success') {
      // 1. Mark Order as Paid
      await db.order.update({
        where: { orderNumber: orderId },
        data: { paymentStatus: 'paid' }
      });

      // 2. Process Settlement (Split payment logic)
      if (sellerConfig?.mode === 'split') {
        // Calculate commission (example 10%)
        const commissionAmount = order.total * 0.10;
        await SettlementEngine.processSplitPayment(
          orderId,
          order.store.sellerId,
          order.total,
          commissionAmount
        );
      } else if (sellerConfig?.mode === 'direct') {
        // No commission taken instantly, just add to seller balance directly or they already got it in their gateway
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[WebhookAPI] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
