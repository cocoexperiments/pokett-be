import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from './schemas/group.schema';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { Logger } from '@nestjs/common';
import { GroupResponseDto } from './dto/group-response.dto';

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
  private readonly logger = new Logger(GroupsController.name);
  
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all groups where the authenticated user is a member' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of groups retrieved successfully.',
    type: [GroupResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findUserGroups(@Request() req: RequestWithUser): Promise<GroupResponseDto[]> {
    this.logger.debug('Finding groups for user', { 
      userId: req.authenticated_user.id,
      userEmail: req.authenticated_user.email 
    });
    
    const groups = await this.groupsService.findUserGroups(req.authenticated_user.id);
    
    return groups.map(group => ({
      _id: group._id.toString(),
      name: group.name,
      members: group.members.map(member => ({
        _id: member._id.toString(),
        name: member.name,
        email: member.email
      })),
      totalSpent: group.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    }));
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
    this.logger.debug('Creating new group', { groupName: createGroupDto.name });
    const group = await this.groupsService.create(createGroupDto);
    this.logger.debug('Group created successfully', { 
      groupId: group._id,
      memberCount: group.members.length 
    });
    return group;
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
    this.logger.debug('Finding group by id', { groupId: id });
    const group = await this.groupsService.findOne(id);
    this.logger.debug('Found group', { 
      groupId: id,
      groupName: group.name,
      memberCount: group.members.length,
      expenseCount: group.expenses.length
    });
    return group;
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
    this.logger.debug('Getting group stats', { groupId: id });
    const stats = await this.groupsService.getGroupStats(id);
    this.logger.debug('Retrieved group stats', { 
      groupId: id,
      totalSpent: stats.totalSpent,
      memberCount: stats.memberBalances.length
    });
    return stats;
  }
} 