import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { Expense } from '../expenses/schemas/expense.schema';
import { User } from '../users/schemas/user.schema';
import { BalancesService } from '../balances/balances.service';

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
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private balancesService: BalancesService
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

  async getGroupStats(groupId: string): Promise<GroupStats> {
    const group = await this.groupModel
      .findById(groupId)
      .populate<{ expenses: Expense[] }>('expenses')
      .populate<{ members: User[] }>('members', 'name email');

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Calculate total spent
    const totalSpent = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get balances for each member
    const memberBalances = await Promise.all(
      group.members.map(async (member) => {
        if (!member.name || !member.email) {
          throw new Error(`Member ${member._id} is missing required fields (name or email)`);
        }

        const userId = member._id.toString();
        const balances = await this.balancesService.getUserBalances(userId, groupId);
        
        const owes: MemberToMemberBalance[] = [];
        const isOwed: MemberToMemberBalance[] = [];
        let totalBalance = 0;

        balances.forEach(({ userId: otherUserId, amount }) => {
          if (amount < 0) {
            // Current user owes money
            owes.push({
              fromUserId: userId,
              toUserId: otherUserId,
              amount: Math.abs(amount)
            });
          } else if (amount > 0) {
            // Current user is owed money
            isOwed.push({
              fromUserId: otherUserId,
              toUserId: userId,
              amount
            });
          }
          totalBalance += amount;
        });

        const memberBalance: MemberBalance = {
          userId,
          name: member.name,
          email: member.email,
          totalBalance,
          owes,
          isOwed
        };

        return memberBalance;
      })
    );

    return {
      totalSpent,
      memberBalances
    };
  }
} 