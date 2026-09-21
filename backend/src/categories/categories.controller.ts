import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { objectIdSchema } from '../common/object-id.schema';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { createCategorySchema, updateCategorySchema } from './categories.dto';
import { CategoriesService } from './categories.service';
import type { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAllActive();
  }

  @Get('admin/all')
  findAllAdmin() {
    return this.categoriesService.findAll();
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createCategorySchema)) dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @Body(new ZodValidationPipe(updateCategorySchema)) dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ZodValidationPipe(objectIdSchema)) id: string) {
    return this.categoriesService.remove(id);
  }
}
