import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateBalance(userId: string, otherUserId: string, amount: number): Promise<void> {
    const user = await this.findOne(userId);
    const currentBalance = user.balances.get(otherUserId) || 0;
    user.balances.set(otherUserId, currentBalance + amount);
    await user.save();

    const otherUser = await this.findOne(otherUserId);
    const otherCurrentBalance = otherUser.balances.get(userId) || 0;
    otherUser.balances.set(userId, otherCurrentBalance - amount);
    await otherUser.save();
  }
} 