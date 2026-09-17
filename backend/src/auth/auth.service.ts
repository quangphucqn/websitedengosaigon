import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './admin.schema';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.adminModel.countDocuments();
    if (count > 0) {
      this.logger.log('Admin đã sẵn sàng.');
      return;
    }
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) {
      this.logger.warn(
        'Chưa có admin và thiếu ADMIN_EMAIL / ADMIN_PASSWORD trong .env.',
      );
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await this.adminModel.create({ email, passwordHash });
    this.logger.log(`Đã tạo admin từ .env: ${email}`);
  }

  async login(dto: LoginDto) {
    const admin = await this.adminModel.findOne({
      email: dto.email.toLowerCase().trim(),
    });
    if (!admin) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }
    const ok = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }
    const accessToken = await this.jwtService.signAsync({
      sub: admin._id.toString(),
      email: admin.email,
    });
    return {
      accessToken,
      admin: { email: admin.email },
    };
  }
}
