import { Controller, Get, Post, Request, Query, Body } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { BalancesService } from "./balances.service";
import { RequestWithUser } from "src/auth/interfaces/request-with-user.interface";
import { SettleBalanceDto } from "./dto/settle-balance.dto";

@ApiTags("balances")
@ApiBearerAuth("Bearer Token")
@Controller("balances")
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get()
  @ApiOperation({
    summary: "Get all balances for the authenticated user",
    description:
      "Returns a list of balances where the authenticated user is involved. Can be filtered by group.",
  })
  @ApiQuery({
    name: "groupId",
    required: false,
    description: "Optional group ID to get balances for a specific group",
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns a list of balances where the authenticated user is involved",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "ID of the other user in the balance relationship",
          },
          amount: {
            type: "number",
            description:
              "Balance amount (positive means other user owes money, negative means authenticated user owes money)",
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getUserBalances(
    @Request() req: RequestWithUser,
    @Query("groupId") groupId?: string
  ) {
    if (!req.authenticated_user?._id) {
      throw new Error("User not authenticated");
    }
    return this.balancesService.getUserBalances(
      req.authenticated_user._id.toString(),
      groupId
    );
  }

  @Post('settle')
  @ApiOperation({
    summary: 'Settle balances with another user',
    description: 'Settles balances between the authenticated user and another user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance settlement successful',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async settleBalance(
    @Request() req: RequestWithUser,
    @Body() settleBalanceDto: SettleBalanceDto
  ) {
    if (!req.authenticated_user?._id) {
      throw new Error('User not authenticated');
    }
    
    await this.balancesService.settleBalance(
      req.authenticated_user._id.toString(),
      settleBalanceDto.userId,
      settleBalanceDto.amount
    );

    return { message: 'Balance settled successfully' };
  }
}
