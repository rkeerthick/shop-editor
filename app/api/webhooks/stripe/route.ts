import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendLowStockAlert, sendNewOrderAlert, sendOrderConfirmation } from "@/lib/email";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

const LOW_STOCK_THRESHOLD = 5;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;

    const order = await db.order.findUnique({
      where: { stripePaymentIntentId: pi.id },
      include: {
        items: { include: { product: true } },
        shop: { include: { owner: true } },
        customer: true,
      },
    });

    if (!order) return NextResponse.json({ received: true });

    await db.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    // Decrement stock for each ordered item
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Send order confirmation to customer
    await sendOrderConfirmation({
      customerEmail: order.customer.email,
      customerName: order.customer.name ?? "Customer",
      shopName: order.shop.name,
      orderId: order.id,
      items: order.items.map((i) => ({
        title: i.product.title,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
    }).catch((err) => console.error("[order-confirmation-email]", err));

    // Notify merchant of new order
    if (order.shop.owner.email) {
      await sendNewOrderAlert({
        merchantEmail: order.shop.owner.email,
        shopName: order.shop.name,
        orderId: order.id,
        customerName: order.customer.name ?? "Customer",
        customerEmail: order.customer.email,
        total: Number(order.total),
        itemCount: order.items.length,
      }).catch((err) => console.error("[new-order-alert]", err));
    }

    // Check for low stock and alert merchant
    const updatedProducts = await db.product.findMany({
      where: {
        id: { in: order.items.map((i) => i.productId) },
        stock: { lte: LOW_STOCK_THRESHOLD, gte: 0 },
      },
      select: { title: true, stock: true },
    });

    if (updatedProducts.length > 0 && order.shop.owner.email) {
      await sendLowStockAlert({
        merchantEmail: order.shop.owner.email,
        shopName: order.shop.name,
        products: updatedProducts,
      }).catch((err) => console.error("[low-stock-alert]", err));
    }
  }

  return NextResponse.json({ received: true });
}
