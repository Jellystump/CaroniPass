export interface WalletBalance {
  readonly walletId: string;
  readonly currency: 'USD' | 'USDT' | 'VES' | 'BTC' | 'ETH';
  readonly availableBalance: number; 
  readonly pendingBalance: number;  
  readonly totalBalance: number;     
  readonly lastUpdatedAt: string;
  readonly status: 'active' | 'frozen' | 'suspended';
}