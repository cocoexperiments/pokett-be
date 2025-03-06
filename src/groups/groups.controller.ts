import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from './schemas/group.schema';

@ApiTags('groups')
@ApiBearerAuth('Bearer Token')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

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
} 