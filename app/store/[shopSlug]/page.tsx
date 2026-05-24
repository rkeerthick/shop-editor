import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/storefront/block-renderer";
import type { EditorBlock } from "@/types/blocks";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}): Promise<Metadata> {
  const { shopSlug } = await params;
  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) return {};
  const page = await db.storefrontPage.findFirst({
    where: { shopId: shop.id, OR: [{ isHome: true }, { slug: "home" }] },
    select: { metaTitle: true, metaDescription: true },
    orderBy: { isHome: "desc" },
  });
  const title = page?.metaTitle || shop.name;
  const description = page?.metaDescription || shop.description || undefined;
  const ogImage = shop.bannerUrl || shop.logoUrl || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: shop.name,
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

export default async function StorefrontHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { shopSlug } = await params;
  const { category } = await searchParams;

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) notFound();

  const page = await db.storefrontPage.findFirst({
    where: { shopId: shop.id, OR: [{ isHome: true }, { slug: "home" }] },
    include: { blocks: { orderBy: { order: "asc" }, where: { isVisible: true } } },
    orderBy: { isHome: "desc" }, // prefer isHome: true over slug match
  });

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold mb-3">{shop.name}</h1>
        <p className="text-muted-foreground">This store is coming soon. Check back later!</p>
      </div>
    );
  }

  const blocks: EditorBlock[] = page.blocks.map((b) => ({
    id: b.id,
    type: b.type as EditorBlock["type"],
    order: b.order,
    props: b.props as Record<string, unknown>,
    isVisible: b.isVisible,
  }));

  return <BlockRenderer blocks={blocks} shopSlug={shopSlug} categorySlug={category} />;
}
