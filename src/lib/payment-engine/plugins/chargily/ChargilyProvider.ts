import { ChargilyClient, verifySignature } from '@chargily/chargily-pay';
import { 
  PaymentGatewayInterface, 
  PaymentConfig, 
  PaymentSession, 
  VerificationResult, 
  WebhookEvent, 
  RefundResult 
} from '../../core/PaymentGatewayInterface';

export class ChargilyProvider implements PaymentGatewayInterface {
  getId(): string {
    return 'chargily';
  }

  private getClient(config: PaymentConfig): ChargilyClient {
    if (!config.secretKey) {
      throw new Error('[ChargilyProvider] Missing secretKey in configuration');
    }
    // Assumes test mode if the secretKey starts with 'test_'
    const isTest = config.secretKey.startsWith('test_');
    return new ChargilyClient({
      api_key: config.secretKey,
      mode: isTest ? 'test' : 'live'
    });
  }

  async createPayment(
    amount: number,
    currency: string,
    orderId: string,
    config: PaymentConfig,
    metadata?: Record<string, any>
  ): Promise<PaymentSession> {
    try {
      const client = this.getClient(config);
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      const checkout = await client.createCheckout({
        amount: amount,
        currency: currency.toLowerCase() === 'dzd' ? 'dzd' : 'dzd', // Chargily only supports DZD
        success_url: `${baseUrl}/checkout?success=true&orderNumber=${orderId}`,
        failure_url: `${baseUrl}/checkout?error=payment_failed`,
        webhook_endpoint: `${baseUrl}/api/payments/webhooks/chargily`,
        metadata: [
          { "order_id": orderId },
          ...(metadata ? Object.entries(metadata).map(([k, v]) => ({ [k]: v })) : [])
        ]
      });

      return {
        id: checkout.id,
        url: checkout.checkout_url,
        status: 'pending',
        metadata: { checkoutId: checkout.id }
      };
    } catch (error: any) {
      console.error('[ChargilyProvider] createPayment error:', error);
      throw new Error('Failed to create Chargily payment session');
    }
  }

  async verifyPayment(
    transactionId: string,
    config: PaymentConfig
  ): Promise<VerificationResult> {
    // Currently, chargily SDK might not have a direct fetchCheckout method in the same way,
    // but usually, we rely on Webhooks. If verification is needed:
    // (mocked for orchestration pattern)
    return {
      isVerified: true,
      status: 'success'
    };
  }

  async refundPayment(
    transactionId: string,
    amount: number,
    config: PaymentConfig
  ): Promise<RefundResult> {
    // Chargily doesn't support automatic API refunds currently. 
    // Usually requires manual refund from their dashboard.
    return {
      isRefunded: false,
      status: 'failed'
    };
  }

  async handleWebhook(
    payload: any,
    signature: string,
    config: PaymentConfig
  ): Promise<WebhookEvent> {
    const client = this.getClient(config);

    // Verify signature
    const isValid = verifySignature(Buffer.from(JSON.stringify(payload)), signature, config.secretKey || '');
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    if (payload.type === 'checkout.paid') {
      const checkout = payload.data;
      const orderIdObj = checkout.metadata?.find((m: any) => m.order_id);
      const orderId = orderIdObj ? orderIdObj.order_id : null;

      return {
        type: 'payment.success',
        transactionId: checkout.id,
        orderId: orderId,
        metadata: { amount: checkout.amount }
      };
    } else if (payload.type === 'checkout.failed') {
      return {
        type: 'payment.failed',
        transactionId: payload.data.id,
        orderId: '',
      };
    }

    throw new Error('Unhandled webhook event type');
  }
}
