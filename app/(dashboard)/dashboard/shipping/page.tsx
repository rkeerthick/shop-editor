import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ShippingRatesClient } from "@/components/dashboard/shipping-rates-client";

export default async function ShippingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const rates = await db.shippingRate.findMany({
    where: { shopId: shop.id },
    orderBy: { price: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Shipping</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the shipping options your customers can choose at checkout.
        </p>
      </div>
      <ShippingRatesClient initialRates={rates} />
    </div>
  );
}
