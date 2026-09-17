import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  private ready = false;

  constructor(private readonly config: ConfigService) {}

  private ensureConfigured() {
    if (this.ready) return;
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException(
        'Cloudinary chưa được cấu hình. Kiểm tra .env backend.',
      );
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    this.ready = true;
  }

  async upload(
    file: Express.Multer.File | undefined,
    folder: string,
  ): Promise<string> {
    if (!file) throw new BadRequestException('Chưa chọn file ảnh.');
    this.ensureConfigured();
    const ext = (file.originalname.split('.').pop() ?? 'jpg').toLowerCase();
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    try {
      const result = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: 'image',
        format:
          ext === 'png' || ext === 'webp' || ext === 'jpg' || ext === 'jpeg'
            ? ext
            : undefined,
      });
      return result.secure_url;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Upload ảnh thất bại.';
      throw new InternalServerErrorException(message);
    }
  }
}
