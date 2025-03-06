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

  async authenticate(token: string): Promise<any> {
    // For mock auth, create a fake user with the token as email
    const mockEmail = `mock-user-${Date.now()}@example.com`;
    const mockUser = {
      user_id: `mock_${Date.now()}`,
      email: mockEmail,
    };

    this.mockUsers.set(mockEmail, mockUser);
    const sessionToken = `mock_session_${Date.now()}_${mockEmail}`;
    this.mockTokens.set(sessionToken, mockEmail);

    return {
      status_code: 200,
      session_token: sessionToken,
      user: mockUser,
    };
  }
} 