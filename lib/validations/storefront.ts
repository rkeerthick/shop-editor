import { z } from "zod";

export const createPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  isHome: z.boolean().default(false),
});

const BLOCK_TYPES = ["hero", "product-grid", "banner", "text", "image", "cta"] as const;

export const blockSchema = z.object({
  id: z.string(),
  type: z.enum(BLOCK_TYPES),
  order: z.number().int(),
  props: z.record(z.string(), z.unknown()),
  isVisible: z.boolean().default(true),
});

export const updateBlocksSchema = z.array(blockSchema);

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type BlockInput = z.infer<typeof blockSchema>;
