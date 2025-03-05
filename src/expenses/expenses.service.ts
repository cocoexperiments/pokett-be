import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { CreateExpenseDto, ShareDto } from './dto/create-expense.dto';
import { UsersService } from '../users/users.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    // Convert shares array to Map
    const sharesMap = new Map<string, number>();
    createExpenseDto.shares.forEach((share: ShareDto) => {
      sharesMap.set(share.userId, share.amount);
    });

    const createdExpense = new this.expenseModel({
      ...createExpenseDto,
      shares: sharesMap,
    });

    const savedExpense = await createdExpense.save();

    // Update user balances
    for (const share of createExpenseDto.shares) {
      if (share.userId !== createExpenseDto.paidBy) {
        await this.usersService.updateBalance(
          createExpenseDto.paidBy,
          share.userId,
          share.amount,
        );
      }
    }

    // If this is a group expense, add it to the group
    if (createExpenseDto.groupId) {
      await this.groupsService.addExpense(
        createExpenseDto.groupId,
        savedExpense._id.toString(),
      );
    }

    return savedExpense;
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseModel
      .findById(id)
      .populate('paidBy')
      .populate('categoryId')
      .populate('groupId');

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }
} 