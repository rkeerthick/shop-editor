import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ shopSlug: string; productSlug: string }>;
}) {
  const { shopSlug, productSlug } = await params;

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop || !shop.isActive) notFound();

  const product = await db.product.findFirst({
    where: { shop: { slug: shopSlug }, slug: productSlug, isActive: true },
    include: { variants: true },
  });
  if (!product) notFound();

  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const inStock = product.stock > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          {product.images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full aspect-square object-cover rounded-xl bg-gray-100"
              />
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {product.images.slice(1).map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={img}
                      alt={`${product.title} ${i + 2}`}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100 shrink-0"
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full aspect-square rounded-xl bg-gray-100" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold">${price.toFixed(2)}</span>
              {comparePrice && comparePrice > price && (
                <span className="text-muted-foreground line-through text-sm">
                  ${comparePrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="text-sm">
            {inStock ? (
              <span className="text-green-600 font-medium">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-500 font-medium">Out of stock</span>
            )}
          </div>

          {inStock && (
            <div className="max-w-xs">
              <AddToCartButton
                shopSlug={shopSlug}
                productId={product.id}
                title={product.title}
                price={price}
                image={product.images[0]}
              />
            </div>
          )}

          <a
            href={`/store/${shopSlug}`}
            className="text-sm text-muted-foreground hover:text-foreground mt-2"
          >
            ← Back to store
          </a>
        </div>
      </div>
    </div>
  );
}
