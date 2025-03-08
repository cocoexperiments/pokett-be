import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from './schemas/group.schema';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

class MemberToMemberBalanceResponse {
  @ApiProperty({ description: 'ID of the user who owes money' })
  fromUserId: string;

  @ApiProperty({ description: 'ID of the user who is owed money' })
  toUserId: string;

  @ApiProperty({ description: 'Amount owed' })
  amount: number;
}

class MemberBalanceResponse {
  @ApiProperty({ description: 'ID of the member' })
  userId: string;

  @ApiProperty({ description: 'Name of the member' })
  name: string;

  @ApiProperty({ description: 'Email of the member' })
  email: string;

  @ApiProperty({ description: 'Total balance for the member (positive means they are owed money, negative means they owe money)' })
  totalBalance: number;

  @ApiProperty({
    description: 'List of balances where this member owes money to others',
    type: [MemberToMemberBalanceResponse]
  })
  owes: MemberToMemberBalanceResponse[];

  @ApiProperty({
    description: 'List of balances where others owe money to this member',
    type: [MemberToMemberBalanceResponse]
  })
  isOwed: MemberToMemberBalanceResponse[];
}

class GroupStatsResponse {
  @ApiProperty({ description: 'Total amount spent in the group' })
  totalSpent: number;

  @ApiProperty({
    description: 'Detailed balance information for each member',
    type: [MemberBalanceResponse]
  })
  memberBalances: MemberBalanceResponse[];
}

@ApiTags('groups')
@ApiBearerAuth('Bearer Token')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all groups where the authenticated user is a member' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of groups retrieved successfully.',
    type: [Group]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findUserGroups(@Request() req: RequestWithUser): Promise<Group[]> {
    return this.groupsService.findUserGroups(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ 
    status: 201, 
    description: 'The group has been successfully created.',
    type: Group
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.create(createGroupDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group by id' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The group has been successfully retrieved.',
    type: Group
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async findOne(@Param('id') id: string): Promise<Group> {
    return this.groupsService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get group statistics including total spent and member balances' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Group statistics retrieved successfully.',
    type: GroupStatsResponse
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async getGroupStats(@Param('id') id: string): Promise<GroupStatsResponse> {
    return this.groupsService.getGroupStats(id);
  }
} 