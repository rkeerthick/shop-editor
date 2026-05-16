import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProductSchema } from "@/lib/validations/product";

async function getOwnedProduct(id: string, userId: string) {
  return db.product.findFirst({
    where: { id, shop: { ownerId: userId } },
    include: { variants: true, category: true },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await getOwnedProduct(id, session.user.id);
  if (!product) return NextResponse.json({ data: null, error: "Product not found" }, { status: 404 });

  return NextResponse.json({ data: product, error: null });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedProduct(id, session.user.id);
  if (!existing) return NextResponse.json({ data: null, error: "Product not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const product = await db.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: product, error: null });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedProduct(id, session.user.id);
  if (!existing) return NextResponse.json({ data: null, error: "Product not found" }, { status: 404 });

  await db.product.delete({ where: { id } });
  return NextResponse.json({ data: { id }, error: null });
}
