import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createProductSchema } from "@/lib/validations/product";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const shopId = req.nextUrl.searchParams.get("shopId");
  if (!shopId) return NextResponse.json({ data: null, error: "shopId is required" }, { status: 400 });

  const shop = await db.shop.findFirst({ where: { id: shopId, ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ data: null, error: "Shop not found" }, { status: 404 });

  const products = await db.product.findMany({
    where: { shopId },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: products, error: null });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { shopId, ...rest } = body;
  if (!shopId) return NextResponse.json({ data: null, error: "shopId is required" }, { status: 400 });

  const shop = await db.shop.findFirst({ where: { id: shopId, ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ data: null, error: "Shop not found" }, { status: 404 });

  const parsed = createProductSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const slugTaken = await db.product.findUnique({ where: { shopId_slug: { shopId, slug: parsed.data.slug } } });
  if (slugTaken) {
    return NextResponse.json({ data: null, error: "A product with this slug already exists" }, { status: 409 });
  }

  const product = await db.product.create({
    data: { ...parsed.data, shopId },
  });

  return NextResponse.json({ data: product, error: null }, { status: 201 });
}
