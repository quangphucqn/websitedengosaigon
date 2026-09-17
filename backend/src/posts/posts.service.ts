import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { uniqueSlug } from '../common/slug';
import { sanitizePostHtml } from './html';
import { Post, PostDocument } from './post.schema';
import { CreatePostDto, UpdatePostDto } from './posts.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  findPublished() {
    return this.postModel
      .find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findPublishedBySlug(slug: string) {
    const post = await this.postModel
      .findOne({ slug, isPublished: true })
      .lean();
    if (!post) throw new NotFoundException('Không tìm thấy bài viết.');
    return post;
  }

  findAll() {
    return this.postModel.find().sort({ createdAt: -1 }).lean();
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
