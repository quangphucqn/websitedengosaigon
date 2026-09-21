import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';

const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp']);

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter(_req, file, cb) {
        if (!allowedMime.has(file.mimetype)) {
          return cb(
            new BadRequestException('Chỉ cho phép ảnh JPEG, PNG, WebP.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    const allowed = new Set(['products', 'banners', 'posts']);
    const resolved = folder && allowed.has(folder) ? folder : 'products';
    return this.uploadsService
      .upload(file, `dengosaigon/${resolved}`)
      .then((url) => ({ url }));
  }
}
