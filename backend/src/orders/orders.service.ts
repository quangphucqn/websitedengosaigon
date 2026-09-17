import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { Product, ProductDocument } from '../products/product.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';
import { Order, OrderDocument } from './order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly mailService: MailService,
  ) {}

  findAll() {
    return this.orderModel.find().sort({ createdAt: -1 }).lean();
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id).lean();
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng.');
    }
    return order;
  }

  async create(dto: CreateOrderDto) {
    const snapshots: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }[] = [];

    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId);
      if (!product) {
        throw new BadRequestException('Có sản phẩm không còn tồn tại.');
      }
      snapshots.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const totalAmount = snapshots.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const order = await this.orderModel.create({
      customerName: dto.customerName,
      phone: dto.phone,
      address: dto.address,
      note: dto.note,
      items: snapshots,
      totalAmount,
      status: 'moi',
    });

    await this.mailService.sendOrderNotification(order);
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng.');
    }
    if (order.status === dto.status) {
      return order;
    }
    order.status = dto.status;
    return order.save();
  }
}
