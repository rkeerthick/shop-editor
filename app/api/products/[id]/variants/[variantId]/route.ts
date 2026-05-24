import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateVariantSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().nullable().optional(),
});

async function getOwnedVariant(productId: string, variantId: string, userId: string) {
  return db.productVariant.findFirst({
    where: { id: variantId, productId, product: { shop: { ownerId: userId } } },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id, variantId } = await params;
  const variant = await getOwnedVariant(id, variantId, session.user.id);
  if (!variant) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateVariantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, ...rest } = parsed.data;
  const updated = await db.productVariant.update({
    where: { id: variantId },
    data: { ...rest, ...(name ? { name, options: { name } } : {}) },
  });
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id, variantId } = await params;
  const variant = await getOwnedVariant(id, variantId, session.user.id);
  if (!variant) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  await db.productVariant.delete({ where: { id: variantId } });
  return NextResponse.json({ data: null, error: null });
}
