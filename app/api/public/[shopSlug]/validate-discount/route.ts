import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = await params;
  const { code, subtotal } = await req.json();

  if (!code) return NextResponse.json({ data: null, error: "Code required" }, { status: 400 });

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) return NextResponse.json({ data: null, error: "Shop not found" }, { status: 404 });

  const discount = await db.discountCode.findUnique({
    where: { shopId_code: { shopId: shop.id, code: code.toUpperCase() } },
  });

  if (!discount || !discount.isActive) {
    return NextResponse.json({ data: null, error: "Invalid or inactive discount code" }, { status: 400 });
  }

  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return NextResponse.json({ data: null, error: "Discount code has expired" }, { status: 400 });
  }

  if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
    return NextResponse.json({ data: null, error: "Discount code usage limit reached" }, { status: 400 });
  }

  if (discount.minOrder !== null && Number(subtotal) < Number(discount.minOrder)) {
    return NextResponse.json({
      data: null,
      error: `Minimum order of $${Number(discount.minOrder).toFixed(2)} required`,
    }, { status: 400 });
  }

  const discountAmount =
    discount.type === "PERCENTAGE"
      ? (Number(subtotal) * Number(discount.value)) / 100
      : Math.min(Number(discount.value), Number(subtotal));

  return NextResponse.json({
    data: {
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value: Number(discount.value),
      discountAmount: Math.round(discountAmount * 100) / 100,
    },
    error: null,
  });
}
