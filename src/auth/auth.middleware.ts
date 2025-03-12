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
    this.logger.debug(`[${req.method}] ${req.path} - Processing request`);
    this.logger.debug('Authorization header:', req.headers.authorization);

    const token = this.extractTokenFromHeader(req);
    if (!token) {
      this.logger.debug('No token found in request');
      next();
      return;
    }

    try {
      this.logger.debug('Attempting to validate token');
      const sessionResponse = await this.authService.validateToken(token);
      
      if (!sessionResponse?.user) {
        this.logger.debug('No user found in session response:', sessionResponse);
        next();
        return;
      }

      this.logger.debug('Session validated, looking up user by email:', sessionResponse.user.emails[0].email);
      const user = await this.usersService.findByEmail(sessionResponse.user.emails[0].email);
      
      if (user) {
        this.logger.debug('User found and attached to request:', user.email);
        (req as any).authenticated_user = user;
      } else {
        this.logger.debug('No user found in database');
      }
      next();
    } catch (error) {
      this.logger.error('Error in auth middleware:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 