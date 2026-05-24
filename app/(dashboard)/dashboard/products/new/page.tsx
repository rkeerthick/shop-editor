import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function NewProductPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const categories = await db.category.findMany({
    where: { shopId: shop.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add product</h1>
      <ProductForm shopId={shop.id} categories={categories} />
    </div>
  );
}
