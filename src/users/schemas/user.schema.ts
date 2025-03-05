import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe'
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
    required: false
  })
  @Prop()
  email?: string;

  @ApiProperty({
    description: 'Map of balances with other users',
    example: { 'user123': 50.00, 'user456': -25.50 },
    type: 'object',
    additionalProperties: { type: 'number' }
  })
  @Prop({ type: Map, of: Number, default: {} })
  balances: Map<string, number>;
}

export const UserSchema = SchemaFactory.createForClass(User); 