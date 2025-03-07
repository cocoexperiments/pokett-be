import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type BalanceDocument = Balance & Document;

@Schema({ timestamps: true })
export class Balance extends Document {
  @ApiProperty({
    description: 'The ID of the user who is owed money (creditor)',
    example: '507f1f77bcf86cd799439011'
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creditorId: Types.ObjectId;

  @ApiProperty({
    description: 'The ID of the user who owes money (debtor)',
    example: '507f1f77bcf86cd799439012'
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  debtorId: Types.ObjectId;

  @ApiProperty({
    description: 'The balance amount (always positive, represents how much debtor owes creditor)',
    example: 50.00
  })
  @Prop({ required: true, default: 0 })
  amount: number;

  @ApiProperty({
    description: 'The ID of the group this balance belongs to (optional)',
    example: '507f1f77bcf86cd799439013',
    required: false
  })
  @Prop({ type: Types.ObjectId, ref: 'Group', required: false })
  groupId?: Types.ObjectId;
}

export const BalanceSchema = SchemaFactory.createForClass(Balance); 