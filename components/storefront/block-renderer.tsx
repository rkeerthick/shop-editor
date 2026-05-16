import { db } from "@/lib/db";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import type { EditorBlock } from "@/types/blocks";

function str(v: unknown): string { return v != null ? String(v) : ""; }
function num(v: unknown): number { return Number(v) || 0; }
function bool(v: unknown): boolean { return Boolean(v); }

function HeroBlock({ p }: { p: Record<string, unknown> }) {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center py-28 px-6 bg-gray-900 text-white"
      style={bool(p.backgroundImage) ? { backgroundImage: `url(${str(p.backgroundImage)})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-4">{str(p.heading)}</h1>
        <p className="text-lg opacity-80 mb-8 max-w-xl">{str(p.subheading)}</p>
        {bool(p.buttonText) && (
          <a href={str(p.buttonLink) || "#"} className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            {str(p.buttonText)}
          </a>
        )}
      </div>
    </section>
  );
}

type ProductRow = { id: string; title: string; price: unknown; images: string[]; slug: string };

async function ProductGridBlock({
  p,
  shopSlug,
}: {
  p: Record<string, unknown>;
  shopSlug: string;
}) {
  const cols = num(p.columns) || 3;
  const limit = num(p.limit) || 6;
  const colClass = cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-4" : "grid-cols-3";

  let products: ProductRow[] = [];
  if (shopSlug) {
    products = await db.product.findMany({
      where: { shop: { slug: shopSlug }, isActive: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, price: true, images: true, slug: true },
    });
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {bool(p.heading) && <h2 className="text-2xl font-bold mb-8 text-center">{str(p.heading)}</h2>}
      <div className={`grid ${colClass} gap-6`}>
        {products.length > 0
          ? products.map((product) => (
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
                    <p className="font-medium">{product.title}</p>
                  </a>
                  <p className="text-muted-foreground text-sm mb-3">${Number(product.price).toFixed(2)}</p>
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
              <div key={i} className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-gray-100 aspect-square" />
                <div className="p-4">
                  <p className="font-medium text-muted-foreground">No products yet</p>
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
      className="py-4 px-6 text-center text-sm font-medium"
      style={{ backgroundColor: str(p.backgroundColor) || "#1a1a1a", color: str(p.textColor) || "#fff" }}
    >
      {str(p.text)}
    </div>
  );
  return bool(p.link) ? <a href={str(p.link)}>{content}</a> : content;
}

function TextBlock({ p }: { p: Record<string, unknown> }) {
  return (
    <section className="max-w-3xl mx-auto px-4 py-12" style={{ textAlign: (str(p.alignment) as "left" | "center" | "right") || "left" }}>
      {bool(p.heading) && <h2 className="text-2xl font-bold mb-4">{str(p.heading)}</h2>}
      <p className="text-muted-foreground leading-relaxed">{str(p.body)}</p>
    </section>
  );
}

function ImageBlock({ p }: { p: Record<string, unknown> }) {
  const wrapClass = bool(p.fullWidth) ? "w-full" : "max-w-3xl mx-auto px-4 py-8";
  return (
    <section className={wrapClass}>
      {bool(p.src) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={str(p.src)} alt={str(p.alt)} className="w-full object-cover" />
      ) : null}
      {bool(p.caption) && <p className="text-xs text-muted-foreground text-center mt-2">{str(p.caption)}</p>}
    </section>
  );
}

function CtaBlock({ p }: { p: Record<string, unknown> }) {
  const dark = str(p.variant) !== "light";
  return (
    <section className={`py-20 px-6 text-center ${dark ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
      <h2 className="text-3xl font-bold mb-3">{str(p.heading)}</h2>
      {bool(p.subheading) && <p className="text-lg opacity-70 mb-8">{str(p.subheading)}</p>}
      {bool(p.buttonText) && (
        <a
          href={str(p.buttonLink) || "#"}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${dark ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"}`}
        >
          {str(p.buttonText)}
        </a>
      )}
    </section>
  );
}

export async function BlockRenderer({
  blocks,
  shopSlug = "",
}: {
  blocks: EditorBlock[];
  shopSlug?: string;
}) {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
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
          case "product-grid": return <ProductGridBlock key={block.id} p={p} shopSlug={shopSlug} />;
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
