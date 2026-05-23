import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DiscountsClient } from "@/components/dashboard/discounts-client";

export default async function DiscountsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const codes = await db.discountCode.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
  });

  const serialized = codes.map((c) => ({
    ...c,
    value: Number(c.value),
    minOrder: c.minOrder ? Number(c.minOrder) : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  }));

  return <DiscountsClient shopId={shop.id} initialCodes={serialized} />;
}
