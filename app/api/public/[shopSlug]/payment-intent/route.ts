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
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
  })).min(1),
  discountCodeId: z.string().nullable().optional(),
  discountAmount: z.number().min(0).optional(),
  shippingRateId: z.string().nullable().optional(),
  shippingAmount: z.number().min(0).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ shopSlug: string }> }) {
  try {
    const { shopSlug } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const { customer: customerInput, items: cartItems, discountCodeId, discountAmount: clientDiscountAmount, shippingRateId, shippingAmount: clientShippingAmount } = parsed.data;

    const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
    if (!shop || !shop.isActive) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

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
      if (!product) return NextResponse.json({ error: `Product ${cartItem.productId} not found` }, { status: 400 });

      let unitPrice = Number(product.price);
      let resolvedVariantId: string | null = null;

      if (cartItem.variantId) {
        const variant = product.variants.find((v) => v.id === cartItem.variantId);
        if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 400 });
        unitPrice = Number(variant.price);
        resolvedVariantId = variant.id;
      }

      subtotal += unitPrice * cartItem.quantity;
      lineItems.push({ productId: product.id, variantId: resolvedVariantId, quantity: cartItem.quantity, unitPrice });
    }

    // Server-side discount validation
    let verifiedDiscountAmount = 0;
    let resolvedDiscountCodeId: string | null = null;

    if (discountCodeId) {
      const discount = await db.discountCode.findFirst({
        where: { id: discountCodeId, shopId: shop.id, isActive: true },
      });

      if (discount && (!discount.expiresAt || discount.expiresAt > new Date()) &&
          (discount.usageLimit === null || discount.usageCount < discount.usageLimit) &&
          (discount.minOrder === null || subtotal >= Number(discount.minOrder))) {

        verifiedDiscountAmount = discount.type === "PERCENTAGE"
          ? (subtotal * Number(discount.value)) / 100
          : Math.min(Number(discount.value), subtotal);
        verifiedDiscountAmount = Math.round(verifiedDiscountAmount * 100) / 100;
        resolvedDiscountCodeId = discount.id;
      }
    }

    // Sanity-check client didn't inflate discount
    if (clientDiscountAmount && Math.abs(clientDiscountAmount - verifiedDiscountAmount) > 0.01) {
      verifiedDiscountAmount = 0;
      resolvedDiscountCodeId = null;
    }

    // Server-side shipping validation
    let verifiedShippingAmount = 0;
    let verifiedShippingRateName: string | null = null;

    if (shippingRateId) {
      const rate = await db.shippingRate.findFirst({
        where: { id: shippingRateId, shopId: shop.id, isActive: true },
      });
      if (rate) {
        verifiedShippingAmount = Number(rate.price);
        verifiedShippingRateName = rate.name;
      }
    }

    // Sanity-check client didn't manipulate shipping
    if (clientShippingAmount !== undefined && Math.abs(clientShippingAmount - verifiedShippingAmount) > 0.01) {
      verifiedShippingAmount = 0;
      verifiedShippingRateName = null;
    }

    const total = Math.max(0, subtotal - verifiedDiscountAmount + verifiedShippingAmount);

    // Upsert customer
    const customer = await db.customer.upsert({
      where: { email: customerInput.email },
      update: { name: customerInput.name },
      create: { email: customerInput.email, name: customerInput.name },
    });

    const order = await db.order.create({
      data: {
        shopId: shop.id,
        customerId: customer.id,
        subtotal,
        discountAmount: verifiedDiscountAmount,
        shippingAmount: verifiedShippingAmount,
        shippingRateName: verifiedShippingRateName,
        total,
        discountCodeId: resolvedDiscountCodeId,
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

    // Increment discount usage
    if (resolvedDiscountCodeId) {
      await db.discountCode.update({
        where: { id: resolvedDiscountCodeId },
        data: { usageCount: { increment: 1 } },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.max(50, Math.round(total * 100)),
      currency: "inr",
      metadata: { orderId: order.id, shopId: shop.id },
      automatic_payment_methods: { enabled: true },
    });

    await db.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({ data: { clientSecret: paymentIntent.client_secret, orderId: order.id } });
  } catch (err) {
    console.error("[payment-intent]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
