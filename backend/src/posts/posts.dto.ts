import { z } from 'zod';

export const postQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const postBody = z.object({
  title: z.string().trim().min(4, 'Tiêu đề tối thiểu 4 ký tự.').max(160),
  content: z.string().min(20, 'Nội dung bài viết còn quá ngắn.'),
  coverImage: z
    .union([z.string().url(), z.literal('')])
    .optional()
    .default(''),
  images: z.array(z.string().url()).optional().default([]),
  isPublished: z.coerce.boolean().optional().default(false),
});

export const createPostSchema = postBody;
export const updatePostSchema = postBody.partial();

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type PostQueryDto = z.infer<typeof postQuerySchema>;
