import { z } from 'zod';
import { ORDER_STATUSES } from './order.schema';

const vnPhone = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự.').max(80),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s.-]/g, ''))
    .refine(
      (value) => vnPhone.test(value),
      'Số điện thoại Việt Nam không hợp lệ.',
    ),
  address: z.string().trim().min(8, 'Địa chỉ giao hàng chưa đủ chi tiết.'),
  note: z.string().trim().max(500).optional().default(''),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Thiếu mã sản phẩm.'),
        quantity: z.coerce.number().int().min(1, 'Số lượng tối thiểu là 1.'),
      }),
    )
    .min(1, 'Giỏ hàng đang trống.'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
