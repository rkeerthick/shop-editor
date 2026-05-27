import { db } from "@/lib/db";
import { sendAbandonedCartEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import type { CartItem } from "@/store/cart";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const carts = await db.abandonedCart.findMany({
    where: {
      reminderSentAt: null,
      convertedAt: null,
      createdAt: { lte: oneHourAgo },
    },
    include: { shop: { select: { slug: true, name: true } } },
    take: 50,
  });

  let sent = 0;
  for (const cart of carts) {
    const recoveryUrl = `${process.env.NEXTAUTH_URL}/store/${cart.shop.slug}/checkout?recover=${cart.recoveryToken}`;
    try {
      await sendAbandonedCartEmail({
        customerEmail: cart.email,
        customerName: cart.name ?? undefined,
        shopName: cart.shop.name,
        cartItems: cart.cartItems as unknown as CartItem[],
        recoveryUrl,
      });
      await db.abandonedCart.update({
        where: { id: cart.id },
        data: { reminderSentAt: new Date() },
      });
      sent++;
    } catch (err) {
      console.error("[abandoned-cart-cron] failed for", cart.email, err);
    }
  }

  return NextResponse.json({ sent, total: carts.length });
}
