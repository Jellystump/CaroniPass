export interface WalletBalance {
  readonly usuarioId: string;
  readonly currency: 'VES' | 'USD';
  readonly availableBalance: number;
  readonly pendingBalance: number;
  readonly totalBalance: number;
  readonly lastUpdatedAt: string;
}