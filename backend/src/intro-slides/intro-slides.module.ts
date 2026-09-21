import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntroSlide, IntroSlideSchema } from './intro-slide.schema';
import { IntroSlidesController } from './intro-slides.controller';
import { IntroSlidesService } from './intro-slides.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IntroSlide.name, schema: IntroSlideSchema },
    ]),
  ],
  controllers: [IntroSlidesController],
  providers: [IntroSlidesService],
})
export class IntroSlidesModule {}
