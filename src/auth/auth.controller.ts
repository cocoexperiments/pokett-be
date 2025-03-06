import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ 
    summary: 'Authenticate Stytch token', 
    description: 'Authenticates tokens from the Stytch widget for both Magic Link and OAuth (Google) authentication methods. Returns a session token and user information upon successful authentication.'
  })
  @ApiQuery({ 
    name: 'token',
    type: 'string',
    description: 'Authentication token received from Stytch widget (either from Magic Link or OAuth flow)',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentication successful',
    schema: {
      type: 'object',
      properties: {
        session_token: {
          type: 'string',
          description: 'Token to be used for subsequent authenticated requests'
        },
        session: {
          type: 'object',
          description: 'Session information'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            stytchUserId: { type: 'string' }
          },
          description: 'User information from our database'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid or expired token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  })
  @Get('authenticate')
  async authenticate(@Query('token') token: string) {
    return this.authService.authenticate(token);
  }
} 