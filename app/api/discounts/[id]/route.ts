import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getOwnedDiscount(id: string, userId: string) {
  return db.discountCode.findFirst({ where: { id, shop: { ownerId: userId } } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const discount = await getOwnedDiscount(id, session.user.id);
  if (!discount) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await db.discountCode.update({
    where: { id },
    data: { isActive: body.isActive },
  });
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const discount = await getOwnedDiscount(id, session.user.id);
  if (!discount) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  await db.discountCode.delete({ where: { id } });
  return NextResponse.json({ data: { id }, error: null });
}
