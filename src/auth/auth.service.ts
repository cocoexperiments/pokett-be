import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as stytch from 'stytch';

@Injectable()
export class AuthService {
  private stytchClient: stytch.Client;

  constructor(private configService: ConfigService) {
    this.stytchClient = new stytch.Client({
      project_id: this.configService.get<string>('STYTCH_PROJECT_ID'),
      secret: this.configService.get<string>('STYTCH_SECRET'),
      env: this.configService.get<string>('NODE_ENV') === 'production'
        ? stytch.envs.live
        : stytch.envs.test,
    });
  }

  async validateToken(token: string): Promise<any> {
    try {
      const response = await this.stytchClient.sessions.authenticate({
        session_token: token,
      });
      return response.session;
    } catch (error) {
      return null;
    }
  }

  async loginWithMagicLink(email: string): Promise<any> {
    try {
      const response = await this.stytchClient.magicLinks.email.loginOrCreate({
        email,
        login_magic_link_url: this.configService.get<string>('STYTCH_REDIRECT_URL'),
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async authenticateMagicLink(token: string): Promise<any> {
    try {
      const response = await this.stytchClient.magicLinks.authenticate({
        token,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
} 