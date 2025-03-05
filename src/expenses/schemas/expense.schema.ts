import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Group', required: false })
  groupId?: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  paidBy: Types.ObjectId;

  @Prop({ type: Map, of: Number, required: true })
  shares: Map<string, number>;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense); 