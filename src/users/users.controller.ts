import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { FriendsResponseDto } from './dto/friends-response.dto';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@ApiTags('users')
@ApiBearerAuth('Bearer Token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'The user has been successfully created.',
    type: User
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The user has been successfully retrieved.',
    type: User
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Get('me/friends')
  @ApiOperation({ summary: 'Get all users with whom the authenticated user has a balance' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Search friends by name'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of friends with balances',
    type: [FriendsResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getFriends(
    @Req() req: RequestWithUser,
    @Query('name') name?: string
  ): Promise<FriendsResponseDto[]> {
    const userId = req.authenticated_user._id;
    const friends = await this.usersService.getFriendsWithBalances(userId, name);
    return friends.map(friend => ({
      _id: friend._id,
      name: friend.name,
      email: friend.email
    }));
  }
} 