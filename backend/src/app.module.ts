import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BannersModule } from './banners/banners.module';
import { CategoriesModule } from './categories/categories.module';
import { ContactModule } from './contact/contact.module';
import { IntroSlidesModule } from './intro-slides/intro-slides.module';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './orders/orders.module';
import { PostsModule } from './posts/posts.module';
import { ProductsModule } from './products/products.module';
import { SeedModule } from './seed/seed.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60_000,
          limit: 100,
        },
      ],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
      }),
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    BannersModule,
    IntroSlidesModule,
    ContactModule,
    OrdersModule,
    PostsModule,
    UploadsModule,
    MailModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
