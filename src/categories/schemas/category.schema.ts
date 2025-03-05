import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Food & Dining'
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Icon identifier for the category',
    example: 'restaurant',
    required: false
  })
  @Prop()
  icon?: string;

  @ApiProperty({
    description: 'Color code for the category',
    example: '#FF5733',
    required: false
  })
  @Prop()
  color?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category); 