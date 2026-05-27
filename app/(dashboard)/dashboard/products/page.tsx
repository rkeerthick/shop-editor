import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <p className="text-sm text-slate-500 mt-1">{products.length} product{products.length !== 1 ? "s" : ""}</p>
      </div>

      {products.length === 0 ? (
        /* Empty state — button lives inside the card */
        <div className="bg-white border border-dashed border-slate-200 rounded-xl py-16 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No products yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">Add your first product to start selling</p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add product
          </Link>
        </div>
      ) : (
        /* List view — Add button inside the card header */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-medium text-slate-600">{products.length} product{products.length !== 1 ? "s" : ""}</p>
            <Link
              href="/dashboard/products/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-medium rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add product
            </Link>
          </div>
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
        </div>
      )}
    </div>
  );
}
