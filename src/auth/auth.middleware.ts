import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);
    
    if (!token) {
      next();
      return;
    }

    try {
      const sessionResponse = await this.authService.validateToken(token);
      if (!sessionResponse?.user) {
        next();
        return;
      }

      const user = await this.usersService.findByEmail(sessionResponse.user.emails[0].email);
      if (user) {
        (req as any).authenticated_user = user;
      }
      next();
    } catch (error) {
      this.logger.error(`Error validating token: ${error}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 