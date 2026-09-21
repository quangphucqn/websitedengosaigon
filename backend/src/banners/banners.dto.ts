import { z } from 'zod';
import { objectIdSchema } from '../common/object-id.schema';

const nullableUrl = z
  .union([
    z.string().url(),
    z
      .string()
      .startsWith('/')
      .transform((v) => v || undefined),
    z.literal(''),
  ])
  .transform((v) => v || undefined);

const bannerBody = z.object({
  imageUrl: z.string().url('Ảnh banner phải là URL hợp lệ.'),
  title: z.string().trim().max(120).optional().default(''),
  link: nullableUrl.optional(),
  isActive: z.coerce.boolean().optional().default(true),
});

export const createBannerSchema = bannerBody;
export const updateBannerSchema = bannerBody.partial();
export const reorderBannersSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(100),
});

export type CreateBannerDto = z.infer<typeof createBannerSchema>;
export type UpdateBannerDto = z.infer<typeof updateBannerSchema>;
export type ReorderBannersDto = z.infer<typeof reorderBannersSchema>;
