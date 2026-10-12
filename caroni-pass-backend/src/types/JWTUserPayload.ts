export interface JWTUserPayload {
  readonly sub: string; 
  readonly email?: string;
  readonly roles: readonly ('admin' | 'pasajero' | 'validador_device')[];
  readonly iat: number;
  readonly exp: number;
}