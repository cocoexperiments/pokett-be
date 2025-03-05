import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group extends Document {
  @ApiProperty({
    description: 'The name of the group',
    example: 'Weekend Trip'
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Array of user IDs who are members of the group',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String]
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members: Types.ObjectId[];

  @ApiProperty({
    description: 'Array of expense IDs associated with this group',
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
    type: [String]
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Expense' }] })
  expenses: Types.ObjectId[];
}

export const GroupSchema = SchemaFactory.createForClass(Group); 