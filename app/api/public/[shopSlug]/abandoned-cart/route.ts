import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const saveSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  cartItems: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    title: z.string(),
    price: z.number(),
    image: z.string().optional(),
    quantity: z.number().int().positive(),
  })),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params;
  const body = await req.json().catch(() => null);
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const shop = await db.shop.findUnique({ where: { slug: shopSlug }, select: { id: true } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const { email, name, cartItems } = parsed.data;

  await db.abandonedCart.upsert({
    where: { shopId_email: { shopId: shop.id, email } },
    create: { shopId: shop.id, email, name, cartItems },
    update: { name, cartItems, reminderSentAt: null, convertedAt: null },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params;
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const cart = await db.abandonedCart.findUnique({
    where: { recoveryToken: token },
    include: { shop: { select: { slug: true } } },
  });

  if (!cart || cart.shop.slug !== shopSlug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      email: cart.email,
      name: cart.name,
      cartItems: cart.cartItems,
    },
  });
}
