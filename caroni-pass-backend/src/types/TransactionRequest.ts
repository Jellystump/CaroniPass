export interface TransactionRequest {
  readonly transactionId: string; 
  readonly usuarioId: string;
  readonly unidadId: string;
  readonly monto: number;
  readonly currency: 'VES' | 'USD';
  readonly isOffline?: boolean;
  readonly timestamp: string;   
}