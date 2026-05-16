import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.object({
      line1: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postal_code: z.string().min(1),
      country: z.string().default("US"),
    }),
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  try {
    const { shopSlug } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { customer: customerInput, items: cartItems } = parsed.data;

    const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
    if (!shop || !shop.isActive) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Server-side price lookup — never trust client prices
    const productIds = cartItems.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, shopId: shop.id, isActive: true },
      include: { variants: true },
    });

    type LineItem = { productId: string; variantId: string | null; quantity: number; unitPrice: number };
    const lineItems: LineItem[] = [];
    let subtotal = 0;

    for (const cartItem of cartItems) {
      const product = products.find((p) => p.id === cartItem.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${cartItem.productId} not found` },
          { status: 400 }
        );
      }
      let unitPrice = Number(product.price);
      let resolvedVariantId: string | null = null;

      if (cartItem.variantId) {
        const variant = product.variants.find((v) => v.id === cartItem.variantId);
        if (!variant) {
          return NextResponse.json({ error: "Variant not found" }, { status: 400 });
        }
        unitPrice = Number(variant.price);
        resolvedVariantId = variant.id;
      }

      subtotal += unitPrice * cartItem.quantity;
      lineItems.push({ productId: product.id, variantId: resolvedVariantId, quantity: cartItem.quantity, unitPrice });
    }

    // Upsert customer by email
    const customer = await db.customer.upsert({
      where: { email: customerInput.email },
      update: { name: customerInput.name },
      create: { email: customerInput.email, name: customerInput.name },
    });

    // Create order then items separately to avoid Prisma nested-create type complexity
    const order = await db.order.create({
      data: {
        shopId: shop.id,
        customerId: customer.id,
        subtotal,
        total: subtotal,
        shippingAddress: customerInput.address,
      },
    });

    await db.orderItem.createMany({
      data: lineItems.map((li) => ({
        orderId: order.id,
        productId: li.productId,
        variantId: li.variantId ?? undefined,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
      })),
    });

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(subtotal * 100),
      currency: "usd",
      metadata: { orderId: order.id, shopId: shop.id },
      automatic_payment_methods: { enabled: true },
    });

    // Link payment intent to order
    await db.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      data: { clientSecret: paymentIntent.client_secret, orderId: order.id },
    });
  } catch (err) {
    console.error("[payment-intent]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
