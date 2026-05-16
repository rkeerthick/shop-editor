import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { updateShopSchema } from "@/lib/validations/shop";

async function getOwnedShop(shopId: string, userId: string) {
  return db.shop.findFirst({ where: { id: shopId, ownerId: userId } });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const shop = await getOwnedShop(id, session.user.id);
  if (!shop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: shop });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const shop = await getOwnedShop(id, session.user.id);
  if (!shop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateShopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Check slug uniqueness if changing it
  if (parsed.data.slug && parsed.data.slug !== shop.slug) {
    const taken = await db.shop.findUnique({ where: { slug: parsed.data.slug } });
    if (taken) return NextResponse.json({ error: "This slug is already taken" }, { status: 409 });
  }

  const updated = await db.shop.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: updated });
}
