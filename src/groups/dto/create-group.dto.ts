import { IsString, IsArray, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({
    description: 'The name of the group',
    example: 'Weekend Trip'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Array of user IDs who are members of the group',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String]
  })
  @IsArray()
  @IsMongoId({ each: true })
  members: string[];
} 