import { Injectable } from '@nestjs/common';
import { IAuthService } from './interfaces/auth.interface';

@Injectable()
export class MockAuthService implements IAuthService {
  private mockUsers: Map<string, any> = new Map();
  private mockTokens: Map<string, string> = new Map();

  async validateToken(token: string): Promise<any> {
    const email = this.mockTokens.get(token);
    if (!email) {
      return null;
    }
    return {
      user_id: `mock_${email}`,
      email: email,
    };
  }

  async loginWithMagicLink(email: string): Promise<any> {
    // Generate a mock magic link token
    const mockToken = `mock_magic_${Date.now()}_${email}`;
    this.mockUsers.set(email, {
      user_id: `mock_${email}`,
      email: email,
    });

    console.log(`\n[Mock Auth] Magic Link Token for ${email}: ${mockToken}\n`);

    return {
      status_code: 200,
      request_id: 'mock_request',
      email_id: 'mock_email',
    };
  }

  async authenticateMagicLink(token: string): Promise<any> {
    // Extract email from mock token
    const email = token.split('_')[3];
    if (!email || !this.mockUsers.has(email)) {
      throw new Error('Invalid token');
    }

    // Generate session token
    const sessionToken = `mock_session_${Date.now()}_${email}`;
    this.mockTokens.set(sessionToken, email);

    return {
      status_code: 200,
      session_token: sessionToken,
      user: this.mockUsers.get(email),
    };
  }
} 