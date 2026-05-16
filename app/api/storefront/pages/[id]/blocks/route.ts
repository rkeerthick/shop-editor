import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateBlocksSchema } from "@/lib/validations/storefront";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const page = await db.storefrontPage.findFirst({
    where: { id, shop: { ownerId: session.user.id } },
  });
  if (!page) return NextResponse.json({ data: null, error: "Page not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateBlocksSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 });
  }

  await db.storefrontBlock.deleteMany({ where: { pageId: id } });

  if (parsed.data.length > 0) {
    await db.storefrontBlock.createMany({
      data: parsed.data.map((b) => ({
        id: b.id,
        pageId: id,
        type: b.type,
        order: b.order,
        props: b.props as object,
        isVisible: b.isVisible,
      })),
    });
  }

  const updated = await db.storefrontPage.findUnique({
    where: { id },
    include: { blocks: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ data: updated, error: null });
}
