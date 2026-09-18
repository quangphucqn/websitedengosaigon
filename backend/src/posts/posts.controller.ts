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
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  createPostSchema,
  type CreatePostDto,
  type UpdatePostDto,
  updatePostSchema,
} from './posts.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  published(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.postsService.findPublished({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('admin/all')
  all(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.postsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('admin/:id')
  findById(@Param('id') id: string) {
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
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePostSchema)) dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
