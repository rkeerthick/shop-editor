import { db } from "@/lib/db";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import type { EditorBlock } from "@/types/blocks";

function str(v: unknown): string { return v != null ? String(v) : ""; }
function num(v: unknown): number { return Number(v) || 0; }
function bool(v: unknown): boolean { return Boolean(v); }

function HeroBlock({ p }: { p: Record<string, unknown> }) {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center py-36 px-6 bg-slate-900 text-white overflow-hidden"
      style={bool(p.backgroundImage) ? { backgroundImage: `url(${str(p.backgroundImage)})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
    >
      <div className="absolute inset-0 bg-linear-to-br from-slate-900/80 via-indigo-950/60 to-slate-900/80" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold mb-5 leading-tight tracking-tight">{str(p.heading)}</h1>
        <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">{str(p.subheading)}</p>
        {bool(p.buttonText) && (
          <a
            href={str(p.buttonLink) || "#"}
            className="store-btn inline-flex items-center px-8 py-3.5 text-white font-semibold transition-all shadow-lg hover:-translate-y-0.5"
          >
            {str(p.buttonText)}
          </a>
        )}
      </div>
    </section>
  );
}

type ProductRow = { id: string; title: string; price: unknown; images: string[]; slug: string };
type CategoryRow = { id: string; name: string; slug: string };

async function ProductGridBlock({
  p, shopSlug, categorySlug,
}: {
  p: Record<string, unknown>;
  shopSlug: string;
  categorySlug?: string;
}) {
  const cols = num(p.columns) || 3;
  const limit = num(p.limit) || 6;
  const colClass = cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3";

  let products: ProductRow[] = [];
  let categories: CategoryRow[] = [];

  if (shopSlug) {
    const shop = await db.shop.findUnique({ where: { slug: shopSlug }, select: { id: true } });
    if (shop) {
      categories = await db.category.findMany({
        where: { shopId: shop.id },
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      });

      const activeCategory = categorySlug
        ? categories.find((c) => c.slug === categorySlug)
        : null;

      products = await db.product.findMany({
        where: {
          shop: { slug: shopSlug },
          isActive: true,
          ...(activeCategory ? { categoryId: activeCategory.id } : {}),
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, price: true, images: true, slug: true },
      });
    }
  }

  // Build base URL for category links (preserve other search params isn't needed here)
  const baseHref = `/store/${shopSlug}`;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {bool(p.heading) && (
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">{str(p.heading)}</h2>
          <div className="brand-bg w-12 h-1 rounded-full mx-auto mt-3" />
        </div>
      )}

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <a
            href={baseHref}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              !categorySlug
                ? "brand-bg text-white border-transparent"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`${baseHref}?category=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                categorySlug === cat.slug
                  ? "brand-bg text-white border-transparent"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>
      )}

      <div className={`grid ${colClass} gap-6`}>
        {products.length > 0
          ? products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                <a href={`/store/${shopSlug}/products/${product.slug}`} className="block">
                  <div className="bg-slate-50 aspect-square overflow-hidden">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                </a>
                <div className="p-5">
                  <a href={`/store/${shopSlug}/products/${product.slug}`} className="hover:text-indigo-600 transition-colors">
                    <p className="font-semibold text-slate-800 mb-1 line-clamp-2">{product.title}</p>
                  </a>
                  <p className="brand-text font-bold text-lg mb-4">₹{Number(product.price).toFixed(2)}</p>
                  <AddToCartButton
                    shopSlug={shopSlug}
                    productId={product.id}
                    title={product.title}
                    price={Number(product.price)}
                    image={product.images[0]}
                  />
                </div>
              </div>
            ))
          : Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-100 aspect-square animate-pulse" />
                <div className="p-5">
                  <p className="font-medium text-slate-400 text-sm">No products yet</p>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}

function BannerBlock({ p }: { p: Record<string, unknown> }) {
  const content = (
    <div
      className="py-3.5 px-6 text-center text-sm font-semibold tracking-wide"
      style={{ backgroundColor: str(p.backgroundColor) || "#4F46E5", color: str(p.textColor) || "#fff" }}
    >
      {str(p.text)}
    </div>
  );
  return bool(p.link) ? <a href={str(p.link)}>{content}</a> : content;
}

function TextBlock({ p }: { p: Record<string, unknown> }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16" style={{ textAlign: (str(p.alignment) as "left" | "center" | "right") || "left" }}>
      {bool(p.heading) && <h2 className="text-3xl font-bold text-slate-900 mb-5">{str(p.heading)}</h2>}
      <p className="text-slate-600 leading-relaxed text-lg">{str(p.body)}</p>
    </section>
  );
}

function ImageBlock({ p }: { p: Record<string, unknown> }) {
  const wrapClass = bool(p.fullWidth) ? "w-full" : "max-w-4xl mx-auto px-6 py-10";
  return (
    <section className={wrapClass}>
      {bool(p.src) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={str(p.src)} alt={str(p.alt)} className="w-full object-cover rounded-2xl" />
      ) : null}
      {bool(p.caption) && <p className="text-xs text-slate-400 text-center mt-3">{str(p.caption)}</p>}
    </section>
  );
}

function CtaBlock({ p }: { p: Record<string, unknown> }) {
  const dark = str(p.variant) !== "light";
  return (
    <section className={`py-24 px-6 text-center ${dark ? "bg-slate-900 text-white" : "bg-indigo-50"}`}>
      <h2 className="text-4xl font-bold mb-4 tracking-tight">{str(p.heading)}</h2>
      {bool(p.subheading) && (
        <p className={`text-lg mb-10 max-w-lg mx-auto ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {str(p.subheading)}
        </p>
      )}
      {bool(p.buttonText) && (
        <a
          href={str(p.buttonLink) || "#"}
          className={`store-btn inline-flex items-center px-8 py-3.5 font-semibold transition-all hover:-translate-y-0.5 shadow-lg text-white`}
        >
          {str(p.buttonText)}
        </a>
      )}
    </section>
  );
}

export async function BlockRenderer({ blocks, shopSlug = "", categorySlug }: { blocks: EditorBlock[]; shopSlug?: string; categorySlug?: string }) {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        This page has no content yet.
      </div>
    );
  }

  return (
    <div>
      {blocks.map((block) => {
        const p = block.props;
        switch (block.type) {
          case "hero":         return <HeroBlock key={block.id} p={p} />;
          case "product-grid": return <ProductGridBlock key={block.id} p={p} shopSlug={shopSlug} categorySlug={categorySlug} />;
          case "banner":       return <BannerBlock key={block.id} p={p} />;
          case "text":         return <TextBlock key={block.id} p={p} />;
          case "image":        return <ImageBlock key={block.id} p={p} />;
          case "cta":          return <CtaBlock key={block.id} p={p} />;
          default:             return null;
        }
      })}
    </div>
  );
}
