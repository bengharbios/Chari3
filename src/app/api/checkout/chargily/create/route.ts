import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ChargilyClient } from '@chargily/chargily-pay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true, buyer: true }
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Determine payment model (centralized vs decentralized)
    const sysSetting = await db.systemSetting.findUnique({ where: { key: 'platform_payment_model' } });
    const paymentModel = sysSetting?.value || 'mixed';

    // Get the global chargily setting
    const globalMethod = await db.globalPaymentMethod.findFirst({
      where: { type: 'chargily_pay', isActive: true }
    });

    let globalConfig: any = {};
    if (globalMethod?.configSchema) {
      try { globalConfig = JSON.parse(globalMethod.configSchema); } catch (e) {}
    }

    // Determine seller/store config
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
      return NextResponse.json({ 
        error: 'Chargily is not configured for this store. Please contact support.' 
      }, { status: 400 });
    }

    const mode = secretKey.startsWith('test_') ? 'test' : 'live';
    const client = new ChargilyClient({
      api_key: secretKey,
      mode: mode
    });

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Chargily Pay V2 requires amount >= 100 DZD
    if (order.total < 100) {
      return NextResponse.json({ error: 'Minimum amount for Chargily is 100 DZD' }, { status: 400 });
    }

    const checkout = await client.createCheckout({
      amount: order.total,
      currency: 'dzd',
      success_url: `${baseUrl}/checkout?success=true&orderNumber=${order.orderNumber}`,
      failure_url: `${baseUrl}/checkout?error=payment_failed`,
      webhook_endpoint: `${baseUrl}/api/webhooks/chargily`,
      metadata: [
        { "order_id": order.id }
      ]
    });

    if (checkout && checkout.checkout_url) {
      return NextResponse.json({ success: true, checkout_url: checkout.checkout_url });
    } else {
      return NextResponse.json({ error: 'Failed to generate checkout URL from Chargily' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Chargily Create Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
