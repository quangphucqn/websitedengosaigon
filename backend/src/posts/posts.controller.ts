import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { objectIdSchema } from '../common/object-id.schema';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  createPostSchema,
  postQuerySchema,
  type CreatePostDto,
  type PostQueryDto,
  type UpdatePostDto,
  updatePostSchema,
} from './posts.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  published(
    @Query(new ZodValidationPipe(postQuerySchema)) query: PostQueryDto,
  ) {
    return this.postsService.findPublished(query);
  }

  @Get('admin/all')
  all(@Query(new ZodValidationPipe(postQuerySchema)) query: PostQueryDto) {
    return this.postsService.findAll(query);
  }

  @Get('admin/:id')
  findById(@Param('id', new ZodValidationPipe(objectIdSchema)) id: string) {
    return this.postsService.findById(id);
  }

  @Public()
  @Get(':slug')
  publishedBySlug(@Param('slug') slug: string) {
    return this.postsService.findPublishedBySlug(slug);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createPostSchema)) dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @Body(new ZodValidationPipe(updatePostSchema)) dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ZodValidationPipe(objectIdSchema)) id: string) {
    return this.postsService.remove(id);
  }
}
