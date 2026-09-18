import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    index: true,
    trim: true,
  })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ required: true, default: true, index: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
