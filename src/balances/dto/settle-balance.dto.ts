import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class SettleBalanceDto {
  @ApiProperty({
    description: 'The ID of the user to settle balances with',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The amount to settle',
    example: 50.00,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  amount: number;
} 