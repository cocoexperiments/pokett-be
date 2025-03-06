import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { BalancesService } from './balances.service';
import { User } from '../users/schemas/user.schema';

interface AuthenticatedRequest extends Request {
  user?: User;
}

@ApiTags('balances')
@ApiBearerAuth('Bearer Token')
@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all balances for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of balances where the authenticated user is involved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'ID of the other user in the balance relationship'
          },
          amount: {
            type: 'number',
            description: 'Balance amount (positive means other user owes money, negative means authenticated user owes money)'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserBalances(@Req() req: AuthenticatedRequest) {
    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }
    return this.balancesService.getUserBalances(req.user._id.toString());
  }
} 