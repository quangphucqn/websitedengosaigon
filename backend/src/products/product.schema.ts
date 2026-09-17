import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const PRODUCT_CATEGORIES = [
  'den-ban',
  'den-treo',
  'den-dung',
  'den-ngu',
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true, enum: PRODUCT_CATEGORIES })
  category: ProductCategory;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true, index: true })
  isPublished: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text', description: 'text' });
