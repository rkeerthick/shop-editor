import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getOwnedPage(id: string, userId: string) {
  return db.storefrontPage.findFirst({
    where: { id, shop: { ownerId: userId } },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const page = await getOwnedPage(id, session.user.id);
  if (!page) return NextResponse.json({ data: null, error: "Page not found" }, { status: 404 });

  return NextResponse.json({ data: page, error: null });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const page = await getOwnedPage(id, session.user.id);
  if (!page) return NextResponse.json({ data: null, error: "Page not found" }, { status: 404 });

  const body = await req.json();
  const updated = await db.storefrontPage.update({
    where: { id },
    data: {
      metaTitle: body.metaTitle ?? null,
      metaDescription: body.metaDescription ?? null,
    },
  });
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const page = await getOwnedPage(id, session.user.id);
  if (!page) return NextResponse.json({ data: null, error: "Page not found" }, { status: 404 });

  await db.storefrontPage.delete({ where: { id } });
  return NextResponse.json({ data: { id }, error: null });
}
