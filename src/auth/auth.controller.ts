import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with magic link', description: 'Send a magic link to the provided email address' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com'
        }
      },
      required: ['email']
    }
  })
  @ApiResponse({ status: 200, description: 'Magic link sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  @Post('login')
  async login(@Body('email') email: string) {
    return this.authService.loginWithMagicLink(email);
  }

  @ApiOperation({ summary: 'Authenticate magic link', description: 'Verify and authenticate the magic link token' })
  @ApiQuery({ 
    name: 'token',
    type: 'string',
    description: 'Magic link token received via email',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @Get('authenticate')
  async authenticate(@Query('token') token: string) {
    return this.authService.authenticateMagicLink(token);
  }
} 