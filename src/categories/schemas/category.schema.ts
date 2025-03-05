import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop()
  icon?: string;

  @Prop()
  color?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category); 