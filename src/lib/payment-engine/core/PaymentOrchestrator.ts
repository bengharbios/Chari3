import { PaymentGatewayInterface, PaymentConfig, PaymentSession, VerificationResult, WebhookEvent, RefundResult } from './PaymentGatewayInterface';

export class PaymentOrchestrator {
  private static plugins: Map<string, PaymentGatewayInterface> = new Map();

  /**
   * Register a new payment gateway plugin
   */
  static registerPlugin(gateway: PaymentGatewayInterface) {
    this.plugins.set(gateway.getId(), gateway);
    console.log(`[PaymentEngine] Plugin registered: ${gateway.getId()}`);
  }

  /**
   * Get a registered plugin by ID
   */
  static getPlugin(gatewayId: string): PaymentGatewayInterface {
    const plugin = this.plugins.get(gatewayId);
    if (!plugin) {
      throw new Error(`[PaymentEngine] No plugin found for gateway: ${gatewayId}`);
    }
    return plugin;
  }

  /**
   * Create a payment through the specified gateway
   */
  static async createPayment(
    gatewayId: string,
    amount: number,
    currency: string,
    orderId: string,
    config: PaymentConfig,
    metadata?: Record<string, any>
  ): Promise<PaymentSession> {
    const plugin = this.getPlugin(gatewayId);
    return plugin.createPayment(amount, currency, orderId, config, metadata);
  }

  /**
   * Verify a payment through the specified gateway
   */
  static async verifyPayment(
    gatewayId: string,
    transactionId: string,
    config: PaymentConfig
  ): Promise<VerificationResult> {
    const plugin = this.getPlugin(gatewayId);
    return plugin.verifyPayment(transactionId, config);
  }

  /**
   * Handle webhook from a specified gateway
   */
  static async handleWebhook(
    gatewayId: string,
    payload: any,
    signature: string,
    config: PaymentConfig
  ): Promise<WebhookEvent> {
    const plugin = this.getPlugin(gatewayId);
    return plugin.handleWebhook(payload, signature, config);
  }
}
