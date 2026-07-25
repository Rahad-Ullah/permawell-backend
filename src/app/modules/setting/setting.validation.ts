import { z } from 'zod';

// update setting validation
const updateSettingValidation = z.object({
  body: z
    .object({
      platformFeePercentage: z.number().min(0).max(100).optional(),
      contactInfo: z
        .object({
          email: z.string().email().optional(),
          phone: z.coerce.string().optional(),
          whatsApp: z.string().optional(),
          address: z.string().optional(),
          location: z
            .object({
              type: z.enum(['Point']).default('Point').optional(),
              coordinates: z.array(z.number()).optional(),
            })
            .optional(),
        })
        .optional(),
      socialLinks: z
        .object({
          facebook: z.string().url().or(z.literal('')).optional(),
          instagram: z.string().url().or(z.literal('')).optional(),
          twitter: z.string().url().or(z.literal('')).optional(),
          linkedin: z.string().url().or(z.literal('')).optional(),
          youtube: z.string().url().or(z.literal('')).optional(),
          tiktok: z.string().url().or(z.literal('')).optional(),
          reddit: z.string().url().or(z.literal('')).optional(),
          weChat: z.string().url().or(z.literal('')).optional(),
          discord: z.string().url().or(z.literal('')).optional(),
          telegram: z.string().url().or(z.literal('')).optional(),
        })
        .optional(),
    })
    .strict(),
});

export const SettingValidations = {
  updateSettingValidation,
};