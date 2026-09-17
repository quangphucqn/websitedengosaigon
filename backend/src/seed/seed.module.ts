import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from '../banners/banner.schema';
import { Post, PostSchema } from '../posts/post.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
