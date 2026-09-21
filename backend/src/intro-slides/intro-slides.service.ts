import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateIntroSlideDto,
  ReorderIntroSlidesDto,
  UpdateIntroSlideDto,
} from './intro-slides.dto';
import { IntroSlide, IntroSlideDocument } from './intro-slide.schema';

@Injectable()
export class IntroSlidesService {
  constructor(
    @InjectModel(IntroSlide.name)
    private readonly introSlideModel: Model<IntroSlideDocument>,
  ) {}

  findActive() {
    return this.introSlideModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .lean();
  }

  findAll() {
    return this.introSlideModel.find().sort({ order: 1 }).lean();
  }

  private async assertActiveLimit(isActive: boolean, exceptId?: string) {
    if (!isActive) return;
    const filter = exceptId
      ? { isActive: true, _id: { $ne: exceptId } }
      : { isActive: true };
    const activeCount = await this.introSlideModel.countDocuments(filter);
    if (activeCount >= 5) {
      throw new BadRequestException(
        'Chỉ được hiển thị tối đa 5 slide giới thiệu đang hoạt động.',
      );
    }
  }

  async create(dto: CreateIntroSlideDto) {
    await this.assertActiveLimit(dto.isActive);
    const last = await this.introSlideModel
      .findOne()
      .sort({ order: -1 })
      .lean();
    return this.introSlideModel.create({
      ...dto,
      order: (last?.order ?? -1) + 1,
    });
  }

  async update(id: string, dto: UpdateIntroSlideDto) {
    const slide = await this.introSlideModel.findById(id);
    if (!slide) throw new NotFoundException('Không tìm thấy slide giới thiệu.');
    await this.assertActiveLimit(dto.isActive === true && !slide.isActive, id);
    Object.assign(slide, dto);
    return slide.save();
  }

  async reorder(dto: ReorderIntroSlidesDto) {
    const slides = await this.introSlideModel.find({ _id: { $in: dto.ids } });
    if (slides.length !== dto.ids.length) {
      throw new BadRequestException('Danh sách slide giới thiệu không hợp lệ.');
    }
    await Promise.all(
      dto.ids.map((id, order) =>
        this.introSlideModel.findByIdAndUpdate(id, { order }),
      ),
    );
    return this.findAll();
  }

  async remove(id: string) {
    const slide = await this.introSlideModel.findByIdAndDelete(id);
    if (!slide) throw new NotFoundException('Không tìm thấy slide giới thiệu.');
    return { message: 'Đã xóa slide giới thiệu.' };
  }
}
