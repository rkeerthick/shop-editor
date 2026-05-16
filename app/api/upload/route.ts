import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Image storage is not configured" }, { status: 503 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
  }

  // Convert to base64 data URI — works reliably with Cloudinary REST API
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "shop-editor";

  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const body = new URLSearchParams({
    file: dataUri,
    api_key: apiKey,
    timestamp: String(timestamp),
    folder,
    signature,
  });

  let res: Response;
  let rawText: string;
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      }
    );
    rawText = await res.text();
  } catch (err) {
    console.error("Cloudinary fetch failed:", err);
    return NextResponse.json({ error: "Could not reach Cloudinary" }, { status: 500 });
  }

  if (!res.ok) {
    let message = "Upload failed";
    try {
      const parsed = JSON.parse(rawText) as { error?: { message?: string } };
      message = parsed.error?.message ?? rawText;
    } catch { /* not JSON */ }
    console.error("Cloudinary error:", rawText);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const json = JSON.parse(rawText) as { secure_url: string; public_id: string };
  return NextResponse.json({ data: { url: json.secure_url, publicId: json.public_id } });
}
