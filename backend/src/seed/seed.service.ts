import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from '../banners/banner.schema';
import { Post, PostDocument } from '../posts/post.schema';
import { Product, ProductDocument } from '../products/product.schema';

const images = {
  hero: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1800&q=85',
  pendant:
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85',
  desk: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1200&q=85',
  floor:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85',
  bedroom:
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=85',
  workshop:
    'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=85',
};

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly products: Model<ProductDocument>,
    @InjectModel(Banner.name) private readonly banners: Model<BannerDocument>,
    @InjectModel(Post.name) private readonly posts: Model<PostDocument>,
  ) {}

  async onModuleInit() {
    if (process.env.SEED_DEMO !== 'true') return;
    if (await this.products.exists({})) return;

    await this.products.create([
      {
        name: 'Đèn bàn Mộc Nhiên',
        slug: 'den-ban-moc-nhien',
        description:
          'Đèn bàn gỗ óc chó, tán sáng ấm và dịu cho góc làm việc hoặc đầu giường.',
        price: 1250000,
        images: [images.desk],
        category: 'den-ban',
        stock: 8,
        isFeatured: true,
      },
      {
        name: 'Đèn treo Vòm Gỗ',
        slug: 'den-treo-vom-go',
        description:
          'Dáng vòm tối giản từ gỗ tự nhiên, tạo điểm sáng ấm cúng cho bàn ăn.',
        price: 2450000,
        images: [images.pendant],
        category: 'den-treo',
        stock: 4,
        isFeatured: true,
      },
      {
        name: 'Đèn đứng Chạng Vạng',
        slug: 'den-dung-chang-vang',
        description:
          'Đèn đứng thân gỗ mảnh, phủ ánh sáng vàng mềm cho phòng khách.',
        price: 3150000,
        images: [images.floor],
        category: 'den-dung',
        stock: 3,
        isFeatured: true,
      },
      {
        name: 'Đèn ngủ Lá Sồi',
        slug: 'den-ngu-la-soi',
        description:
          'Chiếc đèn nhỏ bằng gỗ sồi với ánh sáng dịu, dành cho những giờ nghỉ ngơi.',
        price: 890000,
        images: [images.bedroom],
        category: 'den-ngu',
        stock: 12,
        isFeatured: false,
      },
    ]);
    await this.banners.create({
      imageUrl: images.hero,
      title: 'Ánh sáng được làm bằng đôi tay',
      link: '/san-pham',
      order: 0,
      isActive: true,
    });
    await this.posts.create({
      title: 'Chọn ánh sáng ấm cho một góc nhà',
      slug: 'chon-anh-sang-am-cho-mot-goc-nha',
      coverImage: images.workshop,
      images: [],
      isPublished: true,
      content:
        '<p>Ánh sáng không chỉ để nhìn rõ. Khi được đặt vừa đủ, nó tạo nhịp nghỉ cho một ngày dài và khiến chất liệu trong căn phòng trở nên gần gũi hơn.</p><h2>Chọn theo điều bạn muốn giữ lại</h2><p>Một chiếc đèn gỗ có bề mặt mộc thường hợp với nguồn sáng vàng ấm. Hãy bắt đầu bằng góc bàn, đầu giường hoặc bàn ăn — nơi bạn ở lại lâu nhất.</p>',
    });
    this.logger.log('Đã tạo dữ liệu demo.');
  }
}
