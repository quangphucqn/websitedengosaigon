import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { uniqueSlug } from '../common/slug';
import { sanitizePostHtml } from './html';
import { Post, PostDocument } from './post.schema';
import { CreatePostDto, PostQueryDto, UpdatePostDto } from './posts.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  findPublished(query?: PostQueryDto) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const skip = (page - 1) * limit;
    return this._list({ isPublished: true }, { page, limit, skip });
  }

  findAll(query?: PostQueryDto) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;
    return this._list({}, { page, limit, skip });
  }

  private async _list(
    filter: Record<string, unknown>,
    opts: { page: number; limit: number; skip: number },
  ) {
    const [total, items] = await Promise.all([
      this.postModel.countDocuments(filter),
      this.postModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(opts.skip)
        .limit(opts.limit)
        .lean(),
    ]);
    return {
      items,
      total,
      page: opts.page,
      totalPages: Math.ceil(total / opts.limit),
    };
  }

  async findPublishedBySlug(slug: string) {
    const post = await this.postModel
      .findOne({ slug, isPublished: true })
      .lean();
    if (!post) throw new NotFoundException('Không tìm thấy bài viết.');
    return post;
  }

  async findById(id: string) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết.');
    return post;
  }

  async create(dto: CreatePostDto) {
    const slug = await uniqueSlug(
      async (value) => Boolean(await this.postModel.exists({ slug: value })),
      dto.title,
    );
    return this.postModel.create({
      ...dto,
      content: sanitizePostHtml(dto.content),
      slug,
    });
  }

  async update(id: string, dto: UpdatePostDto) {
    const post = await this.findById(id);
    if (dto.title && dto.title !== post.title) {
      post.slug = await uniqueSlug(
        async (value) =>
          Boolean(
            await this.postModel.exists({
              slug: value,
              _id: { $ne: post._id },
            }),
          ),
        dto.title,
      );
    }
    if (dto.content !== undefined) {
      dto.content = sanitizePostHtml(dto.content);
    }
    Object.assign(post, dto);
    return post.save();
  }

  async remove(id: string) {
    const post = await this.postModel.findByIdAndDelete(id);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết.');
    return { message: 'Đã xóa bài viết.' };
  }
}
