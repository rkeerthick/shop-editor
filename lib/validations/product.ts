import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or more"),
  comparePrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).default([]),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
