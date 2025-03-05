import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('email') email: string) {
    return this.authService.loginWithMagicLink(email);
  }

  @Get('authenticate')
  async authenticate(@Query('token') token: string) {
    return this.authService.authenticateMagicLink(token);
  }
} 