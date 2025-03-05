import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense extends Document {
  @ApiProperty({
    description: 'The ID of the group this expense belongs to (optional)',
    example: '507f1f77bcf86cd799439011',
    required: false
  })
  @Prop({ type: Types.ObjectId, ref: 'Group', required: false })
  groupId?: Types.ObjectId;

  @ApiProperty({
    description: 'The total amount of the expense',
    example: 100.00
  })
  @Prop({ required: true })
  amount: number;

  @ApiProperty({
    description: 'The ID of the expense category',
    example: '507f1f77bcf86cd799439011'
  })
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @ApiProperty({
    description: 'Description of the expense',
    example: 'Dinner at Restaurant'
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'The ID of the user who paid the expense',
    example: '507f1f77bcf86cd799439011'
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  paidBy: Types.ObjectId;

  @ApiProperty({
    description: 'Map of user IDs to their share amounts',
    example: { 'user123': 50.00, 'user456': 50.00 },
    type: 'object',
    additionalProperties: { type: 'number' }
  })
  @Prop({ type: Map, of: Number, required: true })
  shares: Map<string, number>;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense); 