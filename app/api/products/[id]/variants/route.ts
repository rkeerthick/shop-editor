import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const variantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be 0 or more"),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
});

async function getOwnedProduct(id: string, userId: string) {
  return db.product.findFirst({ where: { id, shop: { ownerId: userId } } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await getOwnedProduct(id, session.user.id);
  if (!product) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  const variants = await db.productVariant.findMany({
    where: { productId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ data: variants, error: null });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await getOwnedProduct(id, session.user.id);
  if (!product) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = variantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, price, stock, sku } = parsed.data;
  const variant = await db.productVariant.create({
    data: { productId: id, name, options: { name }, price, stock, sku: sku || null },
  });
  return NextResponse.json({ data: variant, error: null }, { status: 201 });
}
