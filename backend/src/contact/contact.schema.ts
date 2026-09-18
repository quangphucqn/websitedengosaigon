import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactDocument = HydratedDocument<Contact>;

@Schema({ timestamps: true, collection: 'contact' })
export class Contact {
  @Prop({ trim: true, default: 'Đèn Gỗ Sài Gòn' })
  brandName: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ trim: true })
  zalo?: string;

  @Prop({ trim: true })
  facebook?: string;

  @Prop({ trim: true })
  instagram?: string;

  @Prop({ trim: true })
  workingHours?: string;

  @Prop({ trim: true })
  mapEmbedUrl?: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
