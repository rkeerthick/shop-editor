import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductImageGallery } from "@/components/storefront/product-image-gallery";
import { ReviewForm } from "@/components/storefront/review-form";
import { Star } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { shopSlug, productSlug } = await params;
  const shop = await db.shop.findUnique({ where: { slug: shopSlug }, select: { name: true } });
  if (!shop) return {};
  const product = await db.product.findFirst({
    where: { shop: { slug: shopSlug }, slug: productSlug, isActive: true },
    select: { title: true, description: true, images: true },
  });
  if (!product) return {};
  const description = product.description ?? `Buy ${product.title} from ${shop.name}`;
  return {
    title: `${product.title} | ${shop.name}`,
    description,
    openGraph: {
      title: `${product.title} | ${shop.name}`,
      description,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

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

  // Approved reviews
  const reviews = await db.review.findMany({
    where: { productId: product.id, isApproved: true },
    orderBy: { createdAt: "desc" },
  });
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  // Related: same category first, then fill from same shop — exclude self
  const related = await db.product.findMany({
    where: {
      shop: { slug: shopSlug },
      isActive: true,
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, price: true, images: true },
  }).then(async (rows) => {
    if (rows.length < 4) {
      const extra = await db.product.findMany({
        where: {
          shop: { slug: shopSlug },
          isActive: true,
          id: { notIn: [product.id, ...rows.map((r) => r.id)] },
        },
        take: 4 - rows.length,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true, price: true, images: true },
      });
      return [...rows, ...extra];
    }
    return rows;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <ProductImageGallery images={product.images} title={product.title} />

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold">₹{price.toFixed(2)}</span>
              {comparePrice && comparePrice > price && (
                <span className="text-muted-foreground line-through text-sm">
                  ₹{comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            {avgRating !== null && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-500">{avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
              </div>
            )}
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

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((r) => (
              <a
                key={r.id}
                href={`/store/${shopSlug}/products/${r.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="bg-slate-50 aspect-square overflow-hidden">
                  {r.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.images[0]}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium text-slate-800 text-sm line-clamp-2 mb-1">{r.title}</p>
                  <p className="brand-text font-bold text-sm">₹{Number(r.price).toFixed(2)}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Customer reviews
          {reviews.length > 0 && <span className="ml-2 text-base font-normal text-slate-400">({reviews.length})</span>}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Review list */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-sm">No reviews yet — be the first!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{r.reviewerName}</span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {r.title && <p className="font-semibold text-slate-800 text-sm mb-1">{r.title}</p>}
                  {r.body && <p className="text-slate-600 text-sm leading-relaxed">{r.body}</p>}
                </div>
              ))
            )}
          </div>

          {/* Submit form */}
          <ReviewForm shopSlug={shopSlug} productId={product.id} />
        </div>
      </section>
    </div>
  );
}
