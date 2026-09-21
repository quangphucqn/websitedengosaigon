import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { uniqueSlug } from '../common/slug';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from './products.dto';
import { Product, ProductDocument } from './product.schema';

function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly categoriesService: CategoriesService,
  ) {}

  private async assertActiveCategory(slug?: string) {
    if (!slug) return;
    if (!(await this.categoriesService.existsActiveSlug(slug))) {
      throw new BadRequestException('Loại đèn không hợp lệ.');
    }
  }

  findAll(query: ProductQueryDto) {
    return this.list(query, { isPublished: true });
  }

  findAllAdmin(query: ProductQueryDto) {
    return this.list(query, {});
  }

  private async list(query: ProductQueryDto, base: Record<string, unknown>) {
    const filter: Record<string, unknown> = { ...base };
    if (query.category) {
      filter.category = query.category;
    }
    if (query.featured !== undefined) {
      filter.isFeatured = query.featured;
    }
    const found = this.productModel.find(filter);
    const sort: Record<string, SortOrder> =
      query.sort === 'price_asc'
        ? { price: 1 }
        : query.sort === 'price_desc'
          ? { price: -1 }
          : { createdAt: -1 };
    const skip = (query.page - 1) * query.limit;
    const [total, items] = await Promise.all([
      this.productModel.countDocuments(filter),
      found.sort(sort).skip(skip).limit(query.limit).lean(),
    ]);
    let results = items;
    if (query.search) {
      const needle = fold(query.search.trim());
      results = items.filter((p) => fold(p.name).includes(needle));
    }
    return {
      items: results,
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findBySlug(slug: string) {
    const bySlug = await this.productModel
      .findOne({ slug, isPublished: true })
      .lean();
    if (bySlug) return bySlug;
    if (/^[a-f\d]{24}$/i.test(slug)) {
      const byId = await this.productModel
        .findOne({ _id: slug, isPublished: true })
        .lean();
      if (byId) return byId;
    }
    throw new NotFoundException('Không tìm thấy sản phẩm.');
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm.');
    }
    return product;
  }

  async create(dto: CreateProductDto) {
    await this.assertActiveCategory(dto.category);
    const slug = await uniqueSlug(
      async (value) => Boolean(await this.productModel.exists({ slug: value })),
      dto.name,
    );
    return this.productModel.create({ ...dto, slug });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.assertActiveCategory(dto.category);
    const product = await this.findById(id);
    if (dto.name && dto.name !== product.name) {
      product.slug = await uniqueSlug(
        async (value) =>
          Boolean(
            await this.productModel.exists({
              slug: value,
              _id: { $ne: product._id },
            }),
          ),
        dto.name,
      );
    }
    Object.assign(product, dto);
    return product.save();
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm.');
    }
    return { message: 'Đã xóa sản phẩm.' };
  }
}
