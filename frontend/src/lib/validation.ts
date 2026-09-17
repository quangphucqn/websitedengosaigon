import { z } from 'zod'

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, 'Vui lòng nhập họ tên.'),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)(3|5|7|8|9)[\d\s.-]{8,}$/, 'Số điện thoại chưa hợp lệ.'),
  address: z.string().trim().min(8, 'Vui lòng nhập địa chỉ chi tiết.'),
  note: z.string().trim().max(500, 'Ghi chú tối đa 500 ký tự.').optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
