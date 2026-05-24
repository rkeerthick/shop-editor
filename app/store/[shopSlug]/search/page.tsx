import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}"` : "Search",
    robots: { index: false, follow: false },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { shopSlug } = await params;
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop || !shop.isActive) notFound();

  const products = query
    ? await db.product.findMany({
        where: {
          shopId: shop.id,
          isActive: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 24,
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Search</h1>
      {query && (
        <p className="text-muted-foreground text-sm mb-6">
          {products.length} result{products.length !== 1 ? "s" : ""} for &quot;{query}&quot;
        </p>
      )}

      {!query && (
        <p className="text-muted-foreground mt-4">Enter a search term to find products.</p>
      )}

      {query && products.length === 0 && (
        <p className="text-muted-foreground mt-4">No products found for &quot;{query}&quot;.</p>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
              <a href={`/store/${shopSlug}/products/${product.slug}`} className="block">
                <div className="bg-gray-100 aspect-square overflow-hidden">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
              </a>
              <div className="p-4">
                <a href={`/store/${shopSlug}/products/${product.slug}`} className="hover:underline">
                  <p className="font-medium text-sm">{product.title}</p>
                </a>
                <p className="text-muted-foreground text-sm mb-3">₹{Number(product.price).toFixed(2)}</p>
                <AddToCartButton
                  shopSlug={shopSlug}
                  productId={product.id}
                  title={product.title}
                  price={Number(product.price)}
                  image={product.images[0]}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
