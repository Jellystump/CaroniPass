export interface JWTUserPayload {
  readonly sub: string; 
  readonly email: string;
  readonly username?: string;
  readonly roles: readonly ('admin' | 'user' | 'merchant' | 'support')[];
  readonly permissions: readonly string[];
  readonly iat: number; 
  readonly exp: number; 
  readonly iss?: string; 
  readonly aud?: string | readonly string[]; 
}