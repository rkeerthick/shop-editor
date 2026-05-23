import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLowStockAlert({
  merchantEmail,
  shopName,
  products,
}: {
  merchantEmail: string;
  shopName: string;
  products: { title: string; stock: number }[];
}) {
  if (!process.env.RESEND_API_KEY) return;

  const productList = products
    .map((p) => `• ${p.title} — ${p.stock} left`)
    .join("\n");

  await resend.emails.send({
    from: "Shop Editor <onboarding@resend.dev>",
    to: merchantEmail,
    subject: `Low stock alert — ${shopName}`,
    text: `Hi,\n\nThe following products in your shop "${shopName}" are running low on stock:\n\n${productList}\n\nLog in to your dashboard to restock: https://shop-editor.vercel.app/dashboard/products\n\n— Shop Editor`,
  });
}
