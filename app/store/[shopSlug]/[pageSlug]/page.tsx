import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { BlockRenderer } from "@/components/storefront/block-renderer";
import type { EditorBlock } from "@/types/blocks";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string; pageSlug: string }>;
}): Promise<Metadata> {
  const { shopSlug, pageSlug } = await params;
  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) return {};
  const page = await db.storefrontPage.findFirst({
    where: { shopId: shop.id, slug: pageSlug },
    select: { title: true, slug: true, isHome: true, metaTitle: true, metaDescription: true },
  });
  if (!page) return {};
  if (page.isHome || page.slug === "home") return { title: page.metaTitle || shop.name };
  const title = page.metaTitle || `${page.title} | ${shop.name}`;
  const description = page.metaDescription || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: shop.name,
    },
  };
}

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string; pageSlug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { shopSlug, pageSlug } = await params;
  const { category } = await searchParams;

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) notFound();

  const page = await db.storefrontPage.findFirst({
    where: { shopId: shop.id, slug: pageSlug },
    include: { blocks: { orderBy: { order: "asc" }, where: { isVisible: true } } },
  });
  if (!page) notFound();

  // Home page always lives at the root URL — redirect to avoid duplicate content
  if (page.isHome || page.slug === "home") redirect(`/store/${shopSlug}`);

  const blocks: EditorBlock[] = page.blocks.map((b) => ({
    id: b.id,
    type: b.type as EditorBlock["type"],
    order: b.order,
    props: b.props as Record<string, unknown>,
    isVisible: b.isVisible,
  }));

  return <BlockRenderer blocks={blocks} shopSlug={shopSlug} categorySlug={category} />;
}
