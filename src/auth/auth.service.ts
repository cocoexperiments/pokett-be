import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as stytch from "stytch";
import { UsersService } from "../users/users.service";
import { Logger } from "@nestjs/common";
@Injectable()
export class AuthService {
  private stytchClient: stytch.Client;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    const projectId = this.configService.get<string>("STYTCH_PROJECT_ID");
    const secret = this.configService.get<string>("STYTCH_SECRET");

    if (!projectId || !secret) {
      throw new Error("Missing Stytch credentials in environment variables");
    }

    this.stytchClient = new stytch.Client({
      project_id: projectId,
      secret: secret,
      env:
        this.configService.get<string>("NODE_ENV") === "production"
          ? stytch.envs.live
          : stytch.envs.test,
    });
  }

  async validateToken(token: string): Promise<any> {
    this.logger.debug('Validating token:', { tokenLength: token?.length });
    try {
      this.logger.debug('Calling Stytch sessions.authenticate');
      const response = await this.stytchClient.sessions.authenticate({
        session_jwt: token,
      });
      this.logger.debug('Stytch response:', {
        hasUser: !!response?.user,
        userId: response?.user?.user_id,
        sessionId: response?.session?.session_id
      });
      return response;
    } catch (error) {
      this.logger.error('Error validating token:', {
        error: error.message,
        errorType: error.type,
        errorDetails: error.details,
        stack: error.stack
      });
      return null;
    }
  }

  async authenticate(token: string): Promise<any> {
    this.logger.debug('Starting authentication with token:', { tokenLength: token?.length });
    try {
      const useImpersonation =
        this.configService.get<string>("USE_IMPERSONATION") === "true";
      let response;

      if (useImpersonation) {
        this.logger.debug('Using impersonation authentication');
        response = await this.stytchClient.impersonation.authenticate({
          impersonation_token: token,
        });
      } else {
        this.logger.debug('Using OAuth authentication');
        response = await this.stytchClient.oauth.authenticate({
          token: token,
          session_duration_minutes: 60 * 24 * 30, // 30 days session
        });
      }

      // After successful authentication, ensure user exists in our database
      const stytchUser = response.user;
      this.logger.debug('Looking up user in database:', { email: stytchUser.emails[0].email });
      
      let user = await this.usersService.findByEmail(
        stytchUser.emails[0].email
      );

      if (!user) {
        this.logger.debug('Creating new user in database');
        user = await this.usersService.create({
          email: stytchUser.emails[0].email,
          name: stytchUser.name?.first_name || "User",
          stytchUserId: response.user_id,
        });
        this.logger.debug('New user created:', { userId: user._id });
      } else if (!user.stytchUserId) {
        this.logger.debug('Updating existing user with Stytch ID');
        user.stytchUserId = response.user_id;
        await user.save();
      }

      return {
        ...response,
        user,
      };
    } catch (error) {
      this.logger.error('Authentication error:', {
        error: error.message,
        errorType: error.type,
        errorDetails: error.details,
        stack: error.stack
      });
      throw error;
    }
  }
}
