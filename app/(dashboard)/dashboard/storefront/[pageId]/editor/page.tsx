import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { BlockEditor } from "@/components/editor/block-editor";
import type { EditorBlock } from "@/types/blocks";

export default async function EditorPage({ params }: { params: Promise<{ pageId: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { pageId } = await params;
  const page = await db.storefrontPage.findFirst({
    where: { id: pageId, shop: { ownerId: session.user.id } },
    include: { blocks: { orderBy: { order: "asc" } }, shop: true },
  });
  if (!page) notFound();

  const blocks: EditorBlock[] = page.blocks.map((b) => ({
    id: b.id,
    type: b.type as EditorBlock["type"],
    order: b.order,
    props: b.props as Record<string, unknown>,
    isVisible: b.isVisible,
  }));

  return (
    <BlockEditor
      pageId={page.id}
      pageTitle={page.title}
      pageSlug={page.slug}
      isHome={page.isHome}
      shopSlug={page.shop.slug}
      initialBlocks={blocks}
      initialMetaTitle={page.metaTitle ?? ""}
      initialMetaDescription={page.metaDescription ?? ""}
    />
  );
}
