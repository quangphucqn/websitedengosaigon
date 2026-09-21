import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IntroSlideDocument = HydratedDocument<IntroSlide>;

@Schema({ timestamps: true })
export class IntroSlide {
  @Prop({ trim: true, default: '' })
  eyebrow: string;

  @Prop({ required: true, trim: true })
  heading: string;

  @Prop({ required: true, trim: true })
  body: string;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ required: true, default: true, index: true })
  isActive: boolean;
}

export const IntroSlideSchema = SchemaFactory.createForClass(IntroSlide);
