import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPageSchema } from "@/lib/validations/storefront";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const shopId = req.nextUrl.searchParams.get("shopId");
  if (!shopId) return NextResponse.json({ data: null, error: "shopId required" }, { status: 400 });

  const shop = await db.shop.findFirst({ where: { id: shopId, ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ data: null, error: "Shop not found" }, { status: 404 });

  const pages = await db.storefrontPage.findMany({
    where: { shopId },
    include: { blocks: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ data: pages, error: null });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { shopId, ...rest } = body;
  if (!shopId) return NextResponse.json({ data: null, error: "shopId required" }, { status: 400 });

  const shop = await db.shop.findFirst({ where: { id: shopId, ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ data: null, error: "Shop not found" }, { status: 404 });

  const parsed = createPageSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 });
  }

  if (parsed.data.isHome) {
    await db.storefrontPage.updateMany({ where: { shopId }, data: { isHome: false } });
  }

  const page = await db.storefrontPage.create({
    data: { ...parsed.data, shopId },
    include: { blocks: true },
  });

  return NextResponse.json({ data: page, error: null }, { status: 201 });
}
