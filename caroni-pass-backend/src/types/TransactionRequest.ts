export interface TransactionRequest {
  readonly transactionId: string;
  readonly senderWalletId: string;
  readonly recipientWalletId: string;
  readonly amount: number;
  readonly currency: 'USD' | 'USDT' | 'VES' | 'BTC' | 'ETH';
  readonly type: 'transfer' | 'payment' | 'withdrawal' | 'deposit';
  readonly description?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: string; 
}