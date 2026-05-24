import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  parentId: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ data: null, error: "Shop not found" }, { status: 404 });

  const category = await db.category.findFirst({ where: { id, shopId: shop.id } });
  if (!category) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updated = await db.category.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ data: null, error: "Shop not found" }, { status: 404 });

  const category = await db.category.findFirst({ where: { id, shopId: shop.id } });
  if (!category) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  await db.category.delete({ where: { id } });
  return NextResponse.json({ data: null, error: null });
}
