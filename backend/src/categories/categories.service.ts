import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { uniqueSlug } from '../common/slug';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { Category, CategoryDocument } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  findAll() {
    return this.categoryModel.find({}).sort({ order: 1, name: 1 }).lean();
  }

  findAllActive() {
    return this.categoryModel
      .find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục.');
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = await uniqueSlug(
      async (value) =>
        Boolean(await this.categoryModel.exists({ slug: value })),
      dto.name,
    );
    return this.categoryModel.create({
      ...dto,
      slug: dto.slug ?? slug,
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findById(id);
    if (dto.name && dto.name !== category.name && !dto.slug) {
      category.slug = await uniqueSlug(
        async (value) =>
          Boolean(
            await this.categoryModel.exists({
              slug: value,
              _id: { $ne: category._id },
            }),
          ),
        dto.name,
      );
    }
    Object.assign(category, dto);
    return category.save();
  }

  async remove(id: string) {
    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Không tìm thấy danh mục.');
    }
    return { message: 'Đã xóa danh mục.' };
  }
}
