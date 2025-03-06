export interface IAuthService {
  validateToken(token: string): Promise<any>;
  loginWithMagicLink(email: string): Promise<any>;
  authenticateMagicLink(token: string): Promise<any>;
} 