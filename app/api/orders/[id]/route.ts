import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const ORDER_STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;
const patchSchema = z.object({ status: z.enum(ORDER_STATUSES) });

async function getOrderForMerchant(id: string, merchantId: string) {
  const shop = await db.shop.findFirst({ where: { ownerId: merchantId } });
  if (!shop) return null;
  return db.order.findFirst({ where: { id, shopId: shop.id } });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const order = await db.order.findFirst({
    where: { id, shopId: shop.id },
    include: {
      customer: true,
      items: {
        include: {
          product: { select: { title: true, images: true } },
          variant: { select: { name: true } },
        },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: order });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await getOrderForMerchant(id, session.user.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const updated = await db.order.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ data: updated });
}
