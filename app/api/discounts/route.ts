import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  shopId: z.string(),
  code: z.string().min(1).max(50),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive(),
  minOrder: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ data: null, error: parsed.error.flatten() }, { status: 400 });

  const { shopId, code, type, value, minOrder, usageLimit, expiresAt } = parsed.data;

  const shop = await db.shop.findFirst({ where: { id: shopId, ownerId: session.user.id } });
  if (!shop) return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

  const existing = await db.discountCode.findUnique({ where: { shopId_code: { shopId, code } } });
  if (existing) return NextResponse.json({ data: null, error: "Code already exists" }, { status: 409 });

  const discount = await db.discountCode.create({
    data: {
      shopId,
      code,
      type,
      value,
      minOrder: minOrder ?? null,
      usageLimit: usageLimit ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json({ data: discount, error: null }, { status: 201 });
}
