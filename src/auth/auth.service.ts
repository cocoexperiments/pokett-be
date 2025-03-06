import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as stytch from 'stytch';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private stytchClient: stytch.Client;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    const projectId = this.configService.get<string>('STYTCH_PROJECT_ID');
    const secret = this.configService.get<string>('STYTCH_SECRET');

    if (!projectId || !secret) {
      throw new Error('Missing Stytch credentials in environment variables');
    }

    this.stytchClient = new stytch.Client({
      project_id: projectId,
      secret: secret,
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
      const redirectUrl = this.configService.get<string>('STYTCH_REDIRECT_URL');
      if (!redirectUrl) {
        throw new Error('Missing STYTCH_REDIRECT_URL in environment variables');
      }

      const response = await this.stytchClient.magicLinks.email.loginOrCreate({
        email,
        login_magic_link_url: redirectUrl,
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

      // After successful Stytch authentication, ensure user exists in our database
      const stytchUser = response.user;
      let user = await this.usersService.findByEmail(stytchUser.emails[0].email);
      
      if (!user) {
        // Create new user if they don't exist
        user = await this.usersService.create({
          email: stytchUser.emails[0].email,
          name: stytchUser.name?.first_name || 'User', // Default name if not provided
          stytchUserId: stytchUser.user_id // Store Stytch user ID for reference
        });
      } else if (!user.stytchUserId) {
        // Update existing user with Stytch ID if not set
        user.stytchUserId = stytchUser.user_id;
        await user.save();
      }

      return {
        ...response,
        user
      };
    } catch (error) {
      throw error;
    }
  }
} 