import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateBannerDto,
  ReorderBannersDto,
  UpdateBannerDto,
} from './banners.dto';
import { Banner, BannerDocument } from './banner.schema';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<BannerDocument>,
  ) {}

  findActive() {
    return this.bannerModel.find({ isActive: true }).sort({ order: 1 }).lean();
  }

  findAll() {
    return this.bannerModel.find().sort({ order: 1 }).lean();
  }

  private async assertActiveLimit(isActive: boolean, exceptId?: string) {
    if (!isActive) return;
    const filter = exceptId
      ? { isActive: true, _id: { $ne: exceptId } }
      : { isActive: true };
    const activeCount = await this.bannerModel.countDocuments(filter);
    if (activeCount >= 5) {
      throw new BadRequestException(
        'Chỉ được hiển thị tối đa 5 banner đang hoạt động.',
      );
    }
  }

  async create(dto: CreateBannerDto) {
    await this.assertActiveLimit(dto.isActive);
    const last = await this.bannerModel.findOne().sort({ order: -1 }).lean();
    return this.bannerModel.create({ ...dto, order: (last?.order ?? -1) + 1 });
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.bannerModel.findById(id);
    if (!banner) throw new NotFoundException('Không tìm thấy banner.');
    await this.assertActiveLimit(dto.isActive === true && !banner.isActive, id);
    Object.assign(banner, dto);
    return banner.save();
  }

  async reorder(dto: ReorderBannersDto) {
    const banners = await this.bannerModel.find({ _id: { $in: dto.ids } });
    if (banners.length !== dto.ids.length) {
      throw new BadRequestException('Danh sách banner không hợp lệ.');
    }
    await Promise.all(
      dto.ids.map((id, order) =>
        this.bannerModel.findByIdAndUpdate(id, { order }),
      ),
    );
    return this.findAll();
  }

  async remove(id: string) {
    const banner = await this.bannerModel.findByIdAndDelete(id);
    if (!banner) throw new NotFoundException('Không tìm thấy banner.');
    return { message: 'Đã xóa banner.' };
  }
}
