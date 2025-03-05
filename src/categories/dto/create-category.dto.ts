import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Food & Dining'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Icon identifier for the category',
    example: 'restaurant',
    required: false
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Color code for the category',
    example: '#FF5733',
    required: false
  })
  @IsOptional()
  @IsString()
  color?: string;
} 