export interface IAuthService {
  validateToken(token: string): Promise<any>;
  authenticate(token: string): Promise<any>;
} 