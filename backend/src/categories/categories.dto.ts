import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự.').max(60),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu -')
    .optional(),
  description: z.string().trim().max(300).optional().default(''),
  order: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
