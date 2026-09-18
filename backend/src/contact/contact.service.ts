import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './contact.schema';

const DEFAULTS: Partial<Contact> = {
  brandName: 'Đèn Gỗ Sài Gòn',
  address: 'Thành phố Hồ Chí Minh',
  phone: '',
  email: 'hello@dengosaigon.vn',
  zalo: '',
  facebook: '',
  instagram: '',
  workingHours: 'Thứ 2 – Thứ 7: 9:00 – 18:00',
  mapEmbedUrl: '',
};

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async get() {
    let doc = await this.contactModel.findOne().lean();
    if (!doc) {
      doc = (await this.contactModel.create(DEFAULTS)).toObject();
    }
    return doc;
  }

  async update(payload: Partial<Contact>) {
    const current = await this.get();
    await this.contactModel.updateOne({ _id: current._id }, { $set: payload });
    return this.get();
  }
}
