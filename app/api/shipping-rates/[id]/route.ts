import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  estimatedDays: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

async function getOwnedRate(id: string, userId: string) {
  return db.shippingRate.findFirst({
    where: { id, shop: { ownerId: userId } },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rate = await getOwnedRate(id, session.user.id);
  if (!rate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await db.shippingRate.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rate = await getOwnedRate(id, session.user.id);
  if (!rate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.shippingRate.delete({ where: { id } });
  return NextResponse.json({ data: null });
}
