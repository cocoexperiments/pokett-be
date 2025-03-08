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
      const session = await this.authService.validateToken(token);
      if (session) {
        const user = await this.usersService.findByEmail(session.user.emails[0].email);
        if (user) {
          req['user'] = user;
        }
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