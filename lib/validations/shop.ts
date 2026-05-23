import { z } from "zod";

const slugField = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(48, "Slug must be under 48 characters")
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens");

export const createShopSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters"),
  slug: slugField,
  description: z.string().max(500).optional(),
});

export const updateShopSchema = z.object({
  name: z.string().min(2).optional(),
  slug: slugField.optional(),
  description: z.string().max(500).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  theme: z.object({
    accentColor: z.string().optional(),
    fontStyle: z.enum(["modern", "classic", "minimal"]).optional(),
    buttonStyle: z.enum(["rounded", "pill", "sharp"]).optional(),
  }).optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
