import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const review = await db.review.findFirst({
    where: { id, product: { shop: { ownerId: session.user.id } } },
  });
  if (!review) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  const { isApproved } = await req.json();
  const updated = await db.review.update({ where: { id }, data: { isApproved } });
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const review = await db.review.findFirst({
    where: { id, product: { shop: { ownerId: session.user.id } } },
  });
  if (!review) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  await db.review.delete({ where: { id } });
  return NextResponse.json({ data: null, error: null });
}
