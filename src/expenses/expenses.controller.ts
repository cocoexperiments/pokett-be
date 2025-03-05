import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './schemas/expense.schema';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ 
    status: 201, 
    description: 'The expense has been successfully created.',
    type: Expense
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() createExpenseDto: CreateExpenseDto): Promise<Expense> {
    return this.expensesService.create(createExpenseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense by id' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The expense has been successfully retrieved.',
    type: Expense
  })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  async findOne(@Param('id') id: string): Promise<Expense> {
    return this.expensesService.findOne(id);
  }
} 