import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(1000).optional(),
  reviewerName: z.string().min(1, "Name is required").max(80),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = await params;

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop || !shop.isActive) {
    return NextResponse.json({ data: null, error: "Shop not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Verify product belongs to this shop
  const product = await db.product.findFirst({
    where: { id: parsed.data.productId, shopId: shop.id, isActive: true },
  });
  if (!product) {
    return NextResponse.json({ data: null, error: "Product not found" }, { status: 404 });
  }

  const review = await db.review.create({
    data: {
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      reviewerName: parsed.data.reviewerName,
      isApproved: false,
    },
  });

  return NextResponse.json({ data: review, error: null }, { status: 201 });
}
