import { db } from "@/lib/db";
import { notFound } from "next/navigation";
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
    select: { title: true, metaTitle: true, metaDescription: true },
  });
  if (!page) return {};
  return {
    title: page.metaTitle || `${page.title} | ${shop.name}`,
    description: page.metaDescription || undefined,
  };
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ shopSlug: string; pageSlug: string }>;
}) {
  const { shopSlug, pageSlug } = await params;

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) notFound();

  const page = await db.storefrontPage.findFirst({
    where: { shopId: shop.id, slug: pageSlug },
    include: { blocks: { orderBy: { order: "asc" }, where: { isVisible: true } } },
  });
  if (!page) notFound();

  const blocks: EditorBlock[] = page.blocks.map((b) => ({
    id: b.id,
    type: b.type as EditorBlock["type"],
    order: b.order,
    props: b.props as Record<string, unknown>,
    isVisible: b.isVisible,
  }));

  return <BlockRenderer blocks={blocks} shopSlug={shopSlug} />;
}
