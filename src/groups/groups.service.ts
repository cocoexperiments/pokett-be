import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const createdGroup = new this.groupModel(createGroupDto);
    return createdGroup.save();
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupModel
      .findById(id)
      .populate('members')
      .populate('expenses');
      
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async addExpense(groupId: string, expenseId: string): Promise<void> {
    const group = await this.findOne(groupId);
    const expenseObjectId = new Types.ObjectId(expenseId);
    group.expenses.push(expenseObjectId);
    await group.save();
  }
} 