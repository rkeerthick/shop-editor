import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";
import { VariantsSection } from "@/components/dashboard/variants-section";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const [product, categories, variants] = await Promise.all([
    db.product.findFirst({ where: { id, shopId: shop.id } }),
    db.category.findMany({ where: { shopId: shop.id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.productVariant.findMany({ where: { productId: id }, orderBy: { createdAt: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit product</h1>
      <ProductForm
        shopId={shop.id}
        categories={categories}
        defaultValues={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description ?? "",
          price: Number(product.price),
          comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
          stock: product.stock,
          images: product.images,
          isActive: product.isActive,
          categoryId: product.categoryId ?? undefined,
        }}
      />
      <VariantsSection
        productId={product.id}
        initialVariants={variants.map((v) => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          stock: v.stock,
          sku: v.sku,
        }))}
      />
    </div>
  );
}
