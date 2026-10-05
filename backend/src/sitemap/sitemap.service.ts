import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../categories/category.schema';
import { Post, PostDocument } from '../posts/post.schema';
import { Product, ProductDocument } from '../products/product.schema';

@Injectable()
export class SitemapService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async generateXml(): Promise<string> {
    const baseUrl = (
      process.env.SITE_URL ||
      process.env.FRONTEND_URL?.split(',')[0] ||
      'https://denthucong.site'
    ).replace(/\/+$/, '');

    const [products, posts, categories] = await Promise.all([
      this.productModel
        .find({ isPublished: true }, { slug: 1, updatedAt: 1 })
        .lean()
        .exec(),
      this.postModel
        .find({ isPublished: true }, { slug: 1, updatedAt: 1 })
        .lean()
        .exec(),
      this.categoryModel
        .find({ isActive: true }, { slug: 1, updatedAt: 1 })
        .lean()
        .exec(),
    ]);

    const staticRoutes = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/san-pham', priority: '0.9', changefreq: 'daily' },
      { path: '/bai-viet', priority: '0.8', changefreq: 'weekly' },
      { path: '/lien-he', priority: '0.7', changefreq: 'monthly' },
    ];

    const escapeXml = (unsafe: string) =>
      unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<':
            return '&lt;';
          case '>':
            return '&gt;';
          case '&':
            return '&amp;';
          case "'":
            return '&apos;';
          case '"':
            return '&quot;';
          default:
            return c;
        }
      });

    const formatIsoDate = (d?: Date | string) => {
      try {
        return d ? new Date(d).toISOString() : new Date().toISOString();
      } catch {
        return new Date().toISOString();
      }
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}${route.path}`)}</loc>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const cat of categories) {
      const lastmod = formatIsoDate(
        (cat as unknown as { updatedAt?: Date }).updatedAt,
      );
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}/san-pham?category=${encodeURIComponent(cat.slug)}`)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const prod of products) {
      const lastmod = formatIsoDate(
        (prod as unknown as { updatedAt?: Date }).updatedAt,
      );
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}/san-pham/${encodeURIComponent(prod.slug)}`)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const post of posts) {
      const lastmod = formatIsoDate(
        (post as unknown as { updatedAt?: Date }).updatedAt,
      );
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}/bai-viet/${encodeURIComponent(post.slug)}`)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>\n`;
    return xml;
  }
}
