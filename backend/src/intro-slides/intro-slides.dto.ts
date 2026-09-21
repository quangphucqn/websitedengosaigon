import { z } from 'zod';
import { objectIdSchema } from '../common/object-id.schema';

const introSlideBody = z.object({
  eyebrow: z.string().trim().max(40).optional().default(''),
  heading: z.string().trim().min(2, 'Tiêu đề tối thiểu 2 ký tự.').max(160),
  body: z.string().trim().min(8, 'Mô tả tối thiểu 8 ký tự.').max(420),
  isActive: z.coerce.boolean().optional().default(true),
});

export const createIntroSlideSchema = introSlideBody;
export const updateIntroSlideSchema = introSlideBody.partial();
export const reorderIntroSlidesSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(20),
});

export type CreateIntroSlideDto = z.infer<typeof createIntroSlideSchema>;
export type UpdateIntroSlideDto = z.infer<typeof updateIntroSlideSchema>;
export type ReorderIntroSlidesDto = z.infer<typeof reorderIntroSlidesSchema>;
