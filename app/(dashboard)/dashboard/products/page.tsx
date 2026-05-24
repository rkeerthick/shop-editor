import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductsTable } from "@/components/dashboard/products-table";

export default async function ProductsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const products = await db.product.findMany({
    where: { shopId: shop.id },
    include: {
      category: { select: { name: true } },
      variants: { select: { id: true, name: true, price: true, stock: true, sku: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/products/new" className={cn(buttonVariants())}>
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="border rounded-lg bg-white p-12 text-center">
          <p className="text-muted-foreground mb-4">No products yet. Add your first one!</p>
          <Link href="/dashboard/products/new" className={cn(buttonVariants())}>
            Add product
          </Link>
        </div>
      ) : (
        <ProductsTable
          products={products.map((p) => ({
            id: p.id,
            title: p.title,
            price: Number(p.price),
            stock: p.stock,
            isActive: p.isActive,
            category: p.category?.name ?? null,
            variants: p.variants.map((v) => ({
              id: v.id,
              name: v.name,
              price: Number(v.price),
              stock: v.stock,
              sku: v.sku,
            })),
          }))}
        />
      )}
    </div>
  );
}
