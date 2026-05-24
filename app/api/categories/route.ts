import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  parentId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ data: null, error: "Shop not found" }, { status: 404 });

  const categories = await db.category.findMany({
    where: { shopId: shop.id },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: categories, error: null });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ data: null, error: "Shop not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const slugTaken = await db.category.findUnique({
    where: { shopId_slug: { shopId: shop.id, slug: parsed.data.slug } },
  });
  if (slugTaken) {
    return NextResponse.json({ data: null, error: "A category with this slug already exists" }, { status: 409 });
  }

  const category = await db.category.create({
    data: { ...parsed.data, shopId: shop.id },
  });

  return NextResponse.json({ data: category, error: null }, { status: 201 });
}
