import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createShopSchema } from "@/lib/validations/shop";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const shops = await db.shop.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: shops, error: null });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createShopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const slugTaken = await db.shop.findUnique({ where: { slug: parsed.data.slug } });
  if (slugTaken) {
    return NextResponse.json({ data: null, error: "This slug is already taken" }, { status: 409 });
  }

  const shop = await db.shop.create({
    data: { ...parsed.data, ownerId: session.user.id },
  });

  return NextResponse.json({ data: shop, error: null }, { status: 201 });
}
