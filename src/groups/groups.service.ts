import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { Expense } from '../expenses/schemas/expense.schema';
import { User } from '../users/schemas/user.schema';
import { BalancesService } from '../balances/balances.service';
import { Logger } from '@nestjs/common';

interface MemberToMemberBalance {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

interface MemberBalance {
  userId: string;
  name: string;
  email: string;
  totalBalance: number;
  owes: MemberToMemberBalance[];
  isOwed: MemberToMemberBalance[];
}

interface GroupStats {
  totalSpent: number;
  memberBalances: MemberBalance[];
}

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private balancesService: BalancesService
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    this.logger.debug('Creating new group', { 
      name: createGroupDto.name,
      memberCount: createGroupDto.members.length 
    });
    const createdGroup = new this.groupModel(createGroupDto);
    const savedGroup = await createdGroup.save();
    this.logger.debug('Group created successfully', { groupId: savedGroup._id });
    return savedGroup;
  }

  async findOne(id: string): Promise<Group> {
    this.logger.debug('Finding group by id', { groupId: id });
    const group = await this.groupModel
      .findById(id)
      .populate('members')
      .populate('expenses');
      
    if (!group) {
      this.logger.warn('Group not found', { groupId: id });
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    
    this.logger.debug('Found group', {
      groupId: id,
      memberCount: group.members.length,
      expenseCount: group.expenses.length
    });
    return group;
  }

  async addExpense(groupId: string, expenseId: string): Promise<void> {
    this.logger.debug('Adding expense to group', { groupId, expenseId });
    const group = await this.findOne(groupId);
    const expenseObjectId = new Types.ObjectId(expenseId);
    group.expenses.push(expenseObjectId);
    await group.save();
    this.logger.debug('Expense added to group successfully', { 
      groupId,
      expenseId,
      totalExpenses: group.expenses.length
    });
  }

  async getGroupStats(groupId: string): Promise<GroupStats> {
    this.logger.debug('Getting group statistics', { groupId });
    
    const group = await this.groupModel
      .findById(groupId)
      .populate<{ expenses: Expense[] }>('expenses')
      .populate<{ members: User[] }>('members', 'name email');

    if (!group) {
      this.logger.warn('Group not found while getting stats', { groupId });
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    this.logger.debug('Group found, calculating stats', {
      groupId,
      expenseCount: group.expenses.length,
      memberCount: group.members.length
    });

    // Calculate total spent
    const totalSpent = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    this.logger.debug('Calculating member balances', { 
      groupId,
      totalSpent,
      memberCount: group.members.length
    });

    // Get balances for each member
    const memberBalances = await Promise.all(
      group.members.map(async (member) => {
        if (!member.name || !member.email) {
          const error = `Member ${member._id} is missing required fields (name or email)`;
          this.logger.error(error, { memberId: member._id });
          throw new Error(error);
        }

        const userId = member._id.toString();
        this.logger.debug('Getting balances for member', { 
          groupId,
          userId,
          memberName: member.name
        });
        
        const balances = await this.balancesService.getUserBalances(userId, groupId);
        
        const owes: MemberToMemberBalance[] = [];
        const isOwed: MemberToMemberBalance[] = [];
        let totalBalance = 0;

        balances.forEach(({ userId: otherUserId, amount }) => {
          if (amount < 0) {
            owes.push({
              fromUserId: userId,
              toUserId: otherUserId,
              amount: Math.abs(amount)
            });
          } else if (amount > 0) {
            isOwed.push({
              fromUserId: otherUserId,
              toUserId: userId,
              amount
            });
          }
          totalBalance += amount;
        });

        this.logger.debug('Calculated member balance', {
          userId,
          memberName: member.name,
          totalBalance,
          owesCount: owes.length,
          isOwedCount: isOwed.length
        });

        return {
          userId,
          name: member.name,
          email: member.email,
          totalBalance,
          owes,
          isOwed
        };
      })
    );

    this.logger.debug('Group stats calculation complete', {
      groupId,
      totalSpent,
      memberBalancesCount: memberBalances.length
    });

    return {
      totalSpent,
      memberBalances
    };
  }

  async findUserGroups(userId: string): Promise<Group[]> {
    this.logger.debug('Finding groups for user', { userId });
    
    const groups = await this.groupModel
      .find({ members: new Types.ObjectId(userId) })
      .populate('members', 'name email')
      .populate('expenses')
      .exec();
    
    this.logger.debug('Found groups for user', {
      userId,
      groupCount: groups.length,
      groupIds: groups.map(g => g._id)
    });
    
    return groups;
  }
} 