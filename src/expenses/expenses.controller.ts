import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './schemas/expense.schema';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto): Promise<Expense> {
    return this.expensesService.create(createExpenseDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Expense> {
    return this.expensesService.findOne(id);
  }
} 