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
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  createBannerSchema,
  reorderBannersSchema,
  type CreateBannerDto,
  type ReorderBannersDto,
  type UpdateBannerDto,
  updateBannerSchema,
} from './banners.dto';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @Get()
  active() {
    return this.bannersService.findActive();
  }

  @Get('admin/all')
  all() {
    return this.bannersService.findAll();
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createBannerSchema)) dto: CreateBannerDto,
  ) {
    return this.bannersService.create(dto);
  }

  @Patch('reorder')
  reorder(
    @Body(new ZodValidationPipe(reorderBannersSchema)) dto: ReorderBannersDto,
  ) {
    return this.bannersService.reorder(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBannerSchema)) dto: UpdateBannerDto,
  ) {
    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
