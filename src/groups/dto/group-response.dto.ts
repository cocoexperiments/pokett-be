import { ApiProperty } from '@nestjs/swagger';

export class MemberResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the member',
    example: '507f1f77bcf86cd799439011'
  })
  _id: string;

  @ApiProperty({
    description: 'The name of the member',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({
    description: 'The email of the member',
    example: 'john.doe@example.com',
    required: false
  })
  email?: string;
}

export class GroupResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the group',
    example: '507f1f77bcf86cd799439011'
  })
  _id: string;

  @ApiProperty({
    description: 'The name of the group',
    example: 'Weekend Trip'
  })
  name: string;

  @ApiProperty({
    description: 'Array of members in the group',
    type: [MemberResponseDto]
  })
  members: MemberResponseDto[];

  @ApiProperty({
    description: 'Total amount spent in the group',
    example: 1500.50
  })
  totalSpent: number;
} 