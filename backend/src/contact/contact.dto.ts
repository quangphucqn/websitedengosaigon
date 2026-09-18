import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .max(500, 'Không được vượt quá 500 ký tự.')
  .transform((v) => (v === '' ? undefined : v))
  .optional();

const requiredString = z
  .string()
  .trim()
  .min(1, 'Không được để trống.')
  .max(200);

export const updateContactSchema = z.object({
  brandName: requiredString.max(120),
  address: optionalString,
  phone: optionalString,
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: 'Email không hợp lệ.',
    })
    .transform((v) => (v === '' ? undefined : v))
    .optional(),
  zalo: optionalString,
  facebook: optionalString,
  instagram: optionalString,
  workingHours: optionalString,
  mapEmbedUrl: z
    .string()
    .trim()
    .max(2000)
    .transform((v) => {
      if (!v) return undefined;
      // Accept either a URL (used as iframe src) OR a full <iframe ... src="..." ...></iframe> tag.
      const trimmed = v.trim();
      const iframeMatch = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
      if (iframeMatch) return iframeMatch[1];
      if (trimmed.startsWith('<iframe')) return undefined; // invalid iframe format
      return trimmed;
    })
    .optional(),
});

export type UpdateContactDto = z.infer<typeof updateContactSchema>;
