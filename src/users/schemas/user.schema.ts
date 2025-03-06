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
    description: 'The Stytch user ID',
    example: 'user-test-123456789',
    required: false
  })
  @Prop({ unique: true, sparse: true })
  stytchUserId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 