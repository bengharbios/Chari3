export interface PaymentConfig {
  [key: string]: any;
}

export interface PaymentSession {
  id: string;
  url?: string;
  status: 'pending' | 'success' | 'failed';
  metadata?: Record<string, any>;
}

export interface VerificationResult {
  isVerified: boolean;
  status: 'pending' | 'success' | 'failed';
  amount?: number;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  isRefunded: boolean;
  refundId?: string;
  status: 'success' | 'failed';
}

export interface WebhookEvent {
  type: 'payment.success' | 'payment.failed' | 'payment.refunded';
  transactionId: string;
  orderId: string;
  metadata?: Record<string, any>;
}

export interface PaymentGatewayInterface {
  /**
   * Returns the unique identifier of the payment gateway (e.g., 'chargily', 'stripe')
   */
  getId(): string;

  /**
   * Creates a new payment session
   */
  createPayment(
    amount: number,
    currency: string,
    orderId: string,
    config: PaymentConfig,
    metadata?: Record<string, any>
  ): Promise<PaymentSession>;

  /**
   * Verifies an existing payment transaction
   */
  verifyPayment(
    transactionId: string,
    config: PaymentConfig
  ): Promise<VerificationResult>;

  /**
   * Refunds a payment
   */
  refundPayment(
    transactionId: string,
    amount: number,
    config: PaymentConfig
  ): Promise<RefundResult>;

  /**
   * Handles and verifies incoming webhook events
   */
  handleWebhook(
    payload: any,
    signature: string,
    config: PaymentConfig
  ): Promise<WebhookEvent>;
}
