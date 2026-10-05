import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../categories/category.schema';
import { Post, PostSchema } from '../posts/post.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { SitemapController } from './sitemap.controller';
import { SitemapService } from './sitemap.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Post.name, schema: PostSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [SitemapController],
  providers: [SitemapService],
  exports: [SitemapService],
})
export class SitemapModule {}
