import { IsString, IsNumber, IsMongoId, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ShareDto {
  @IsMongoId()
  userId: string;

  @IsNumber()
  amount: number;
}

export class CreateExpenseDto {
  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @IsNumber()
  amount: number;

  @IsMongoId()
  categoryId: string;

  @IsString()
  description: string;

  @IsMongoId()
  paidBy: string;

  @ValidateNested({ each: true })
  @Type(() => ShareDto)
  shares: ShareDto[];
} 