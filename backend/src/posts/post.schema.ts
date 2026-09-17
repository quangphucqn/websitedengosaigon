import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: '' })
  coverImage: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: false })
  isPublished: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
