import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const orders = await db.order.findMany({
    where: {
      shopId: shop.id,
      ...(status ? { status: status as never } : {}),
    },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: orders });
}
