import { z } from 'zod';
import { PRODUCT_CATEGORIES } from './product.schema';

const productBody = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự.').max(120),
  description: z.string().trim().min(10, 'Mô tả tối thiểu 10 ký tự.'),
  price: z.coerce.number().int().min(0, 'Giá phải là số nguyên không âm.'),
  images: z
    .array(z.string().url('Ảnh phải là URL hợp lệ.'))
    .max(10)
    .default([]),
  category: z.enum(PRODUCT_CATEGORIES),
  stock: z.coerce.number().int().min(0).default(0),
  isFeatured: z.coerce.boolean().optional().default(false),
  isPublished: z.coerce.boolean().optional().default(true),
});

export const createProductSchema = productBody;
export const updateProductSchema = productBody.partial();

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  sort: z
    .enum(['newest', 'price_asc', 'price_desc'])
    .optional()
    .default('newest'),
  featured: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((value) =>
      value === 'true' ? true : value === 'false' ? false : undefined,
    ),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductQueryDto = z.infer<typeof productQuerySchema>;
