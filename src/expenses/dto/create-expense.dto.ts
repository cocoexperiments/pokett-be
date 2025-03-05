import { IsString, IsNumber, IsMongoId, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ShareDto {
  @ApiProperty({
    description: 'The ID of the user who shares the expense',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    description: 'The amount shared by this user',
    example: 25.50
  })
  @IsNumber()
  amount: number;
}

export class CreateExpenseDto {
  @ApiProperty({
    description: 'The ID of the group this expense belongs to (optional)',
    example: '507f1f77bcf86cd799439011',
    required: false
  })
  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @ApiProperty({
    description: 'The total amount of the expense',
    example: 100.00
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'The ID of the expense category',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  categoryId: string;

  @ApiProperty({
    description: 'Description of the expense',
    example: 'Dinner at Restaurant'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The ID of the user who paid the expense',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  paidBy: string;

  @ApiProperty({
    description: 'Array of shares indicating how the expense is split',
    type: [ShareDto]
  })
  @ValidateNested({ each: true })
  @Type(() => ShareDto)
  shares: ShareDto[];
} 