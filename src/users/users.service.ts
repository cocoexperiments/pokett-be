import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { BalancesService } from '../balances/balances.service';

interface UserWithBalances extends Omit<User, keyof Document> {
  _id: string;
  balances: { [key: string]: number };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly balancesService: BalancesService,
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

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateBalance(userId: string, otherUserId: string, amount: number, groupId?: string): Promise<void> {
    await this.balancesService.updateBalance(userId, otherUserId, amount, groupId);
  }

  async getUserWithBalances(id: string, groupId?: string): Promise<UserWithBalances> {
    const user = await this.findOne(id);
    const balances = await this.balancesService.getUserBalances(id, groupId);
    
    const balancesMap: { [key: string]: number } = {};
    balances.forEach(balance => {
      balancesMap[balance.userId] = balance.amount;
    });

    const userObject = user.toObject();
    return {
      ...userObject,
      _id: userObject._id.toString(),
      balances: balancesMap
    };
  }
} 