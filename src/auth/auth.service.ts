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
    try {
      const response = await this.stytchClient.sessions.authenticate({
        session_jwt: token,
      });
      return response;
    } catch (error) {
      this.logger.error(`Error validating token: ${error}`);
      return null;
    }
  }

  async authenticate(token: string): Promise<any> {
    try {
      const useImpersonation =
        this.configService.get<string>("USE_IMPERSONATION") === "true";
      let response;
      if (useImpersonation) {
        this.logger.debug(`Authenticating with impersonation token`);
        response = await this.stytchClient.impersonation.authenticate({
          impersonation_token: token,
        });
      } else {
        response = await this.stytchClient.oauth.authenticate({
          token: token,
          session_duration_minutes: 60 * 24 * 30, // 30 days session
        });
      }

      // After successful authentication, ensure user exists in our database
      const stytchUser = response.user;
      let user = await this.usersService.findByEmail(
        stytchUser.emails[0].email
      );

      if (!user) {
        // Create new user if they don't exist
        user = await this.usersService.create({
          email: stytchUser.emails[0].email,
          name: stytchUser.name?.first_name || "User",
          stytchUserId: response.user_id,
        });
      } else if (!user.stytchUserId) {
        // Update existing user with Stytch ID if not set
        user.stytchUserId = response.user_id;
        await user.save();
      }

      return {
        ...response,
        user,
      };
    } catch (error) {
      throw error;
    }
  }
}
