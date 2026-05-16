import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const product = await db.product.findFirst({
    where: { id, shopId: shop.id },
  });
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit product</h1>
      <ProductForm
        shopId={shop.id}
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
        }}
      />
    </div>
  );
}
