import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  email?: string;

  @Prop({ type: Map, of: Number, default: {} })
  balances: Map<string, number>;
}

export const UserSchema = SchemaFactory.createForClass(User); 