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
import {
  createIntroSlideSchema,
  reorderIntroSlidesSchema,
  type CreateIntroSlideDto,
  type ReorderIntroSlidesDto,
  type UpdateIntroSlideDto,
  updateIntroSlideSchema,
} from './intro-slides.dto';
import { IntroSlidesService } from './intro-slides.service';

@Controller('intro-slides')
export class IntroSlidesController {
  constructor(private readonly introSlidesService: IntroSlidesService) {}

  @Public()
  @Get()
  active() {
    return this.introSlidesService.findActive();
  }

  @Get('admin/all')
  all() {
    return this.introSlidesService.findAll();
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createIntroSlideSchema))
    dto: CreateIntroSlideDto,
  ) {
    return this.introSlidesService.create(dto);
  }

  @Patch('reorder')
  reorder(
    @Body(new ZodValidationPipe(reorderIntroSlidesSchema))
    dto: ReorderIntroSlidesDto,
  ) {
    return this.introSlidesService.reorder(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @Body(new ZodValidationPipe(updateIntroSlideSchema))
    dto: UpdateIntroSlideDto,
  ) {
    return this.introSlidesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ZodValidationPipe(objectIdSchema)) id: string) {
    return this.introSlidesService.remove(id);
  }
}
