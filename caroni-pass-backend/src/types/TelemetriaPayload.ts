export interface TelemetriaPayload {
  readonly unidadId: string;
  readonly latitud: number;
  readonly longitud: number;
  readonly velocidad?: number; 
  readonly rumbo?: number;     
  readonly timestamp: number;  
  readonly metadata?: {
    readonly bateria?: number;
    readonly estadoRed?: '4g' | '3g' | 'offline';
  };
}