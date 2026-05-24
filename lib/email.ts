import { Resend } from "resend";
import type { CartItem } from "@/store/cart";

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

  const productList = products.map((p) => `• ${p.title} — ${p.stock} left`).join("\n");

  await resend.emails.send({
    from: "Shop Editor <onboarding@resend.dev>",
    to: merchantEmail,
    subject: `Low stock alert — ${shopName}`,
    text: `Hi,\n\nThe following products in your shop "${shopName}" are running low on stock:\n\n${productList}\n\nLog in to your dashboard to restock: https://shop-editor.vercel.app/dashboard/products\n\n— Shop Editor`,
  });
}

export async function sendNewOrderAlert({
  merchantEmail,
  shopName,
  orderId,
  customerName,
  customerEmail,
  total,
  itemCount,
}: {
  merchantEmail: string;
  shopName: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const dashboardUrl = `https://shop-editor.vercel.app/dashboard/orders/${orderId}`;

  await resend.emails.send({
    from: "Shop Editor <onboarding@resend.dev>",
    to: merchantEmail,
    subject: `New order ₹${total.toFixed(2)} — ${shopName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:linear-gradient(135deg,#1e293b,#334155);padding:32px 40px;">
            <p style="margin:0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">New Order</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:700;">₹${total.toFixed(2)}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Customer</p>
                  <p style="margin:4px 0 0;color:#1e293b;font-size:15px;font-weight:600;">${customerName}</p>
                  <p style="margin:2px 0 0;color:#64748b;font-size:13px;">${customerEmail}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Items</p>
                  <p style="margin:4px 0 0;color:#1e293b;font-size:15px;font-weight:600;">${itemCount} item${itemCount !== 1 ? "s" : ""}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <p style="margin:0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Order ID</p>
                  <p style="margin:4px 0 0;color:#1e293b;font-size:13px;font-family:monospace;">${orderId}</p>
                </td>
              </tr>
            </table>
            <div style="margin-top:28px;text-align:center;">
              <a href="${dashboardUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">View Order</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} ${shopName}. Powered by Shop Editor.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    text: `New order received!\n\nCustomer: ${customerName} (${customerEmail})\nItems: ${itemCount}\nTotal: ₹${total.toFixed(2)}\nOrder ID: ${orderId}\n\nView order: ${dashboardUrl}`,
  });
}

export async function sendOrderConfirmation({
  customerEmail,
  customerName,
  shopName,
  orderId,
  items,
  subtotal,
  discountAmount,
  total,
}: {
  customerEmail: string;
  customerName: string;
  shopName: string;
  orderId: string;
  items: { title: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  discountAmount: number;
  total: number;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const itemLines = items
    .map((i) => `  ${i.title} × ${i.quantity}   ₹${(i.unitPrice * i.quantity).toFixed(2)}`)
    .join("\n");

  const discountLine = discountAmount > 0
    ? `  Discount:              -₹${discountAmount.toFixed(2)}\n`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4338ca,#6366f1);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">${shopName}</h1>
            <p style="margin:8px 0 0;color:#c7d2fe;font-size:14px;">Order Confirmation</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 6px;color:#334155;font-size:16px;font-weight:600;">Hi ${customerName},</p>
            <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6;">
              Thanks for your order! We've received your payment and are getting things ready.
            </p>

            <!-- Order ID -->
            <div style="background:#f1f5f9;border-radius:10px;padding:14px 18px;margin-bottom:28px;">
              <p style="margin:0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Order ID</p>
              <p style="margin:4px 0 0;color:#1e293b;font-size:13px;font-family:monospace;">${orderId}</p>
            </div>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td colspan="2" style="border-bottom:2px solid #e2e8f0;padding-bottom:10px;margin-bottom:12px;">
                  <p style="margin:0;color:#1e293b;font-size:14px;font-weight:600;">Order Summary</p>
                </td>
              </tr>
              ${items.map((i) => `
              <tr>
                <td style="padding:12px 0;color:#334155;font-size:14px;border-bottom:1px solid #f1f5f9;">
                  ${i.title} <span style="color:#94a3b8;">× ${i.quantity}</span>
                </td>
                <td style="padding:12px 0;color:#334155;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;">
                  ₹${(i.unitPrice * i.quantity).toFixed(2)}
                </td>
              </tr>`).join("")}
              ${discountAmount > 0 ? `
              <tr>
                <td style="padding:12px 0;color:#16a34a;font-size:14px;">Discount</td>
                <td style="padding:12px 0;color:#16a34a;font-size:14px;font-weight:600;text-align:right;">-₹${discountAmount.toFixed(2)}</td>
              </tr>` : ""}
              <tr>
                <td style="padding:16px 0 0;color:#1e293b;font-size:16px;font-weight:700;">Total</td>
                <td style="padding:16px 0 0;color:#4f46e5;font-size:18px;font-weight:700;text-align:right;">₹${total.toFixed(2)}</td>
              </tr>
            </table>

            <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
              If you have any questions about your order, feel free to reply to this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              © ${new Date().getFullYear()} ${shopName}. Powered by Shop Editor.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: "Shop Editor <onboarding@resend.dev>",
    to: customerEmail,
    subject: `Order confirmed — ${shopName}`,
    html,
    text: `Hi ${customerName},\n\nThanks for your order at ${shopName}!\n\nOrder ID: ${orderId}\n\nItems:\n${itemLines}\n\n${discountLine}Total: ₹${total.toFixed(2)}\n\n— ${shopName}`,
  });
}

export async function sendAbandonedCartEmail({
  customerEmail,
  customerName,
  shopName,
  cartItems,
  recoveryUrl,
}: {
  customerEmail: string;
  customerName?: string;
  shopName: string;
  cartItems: CartItem[];
  recoveryUrl: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const greeting = customerName ? `Hi ${customerName},` : "Hi there,";
  const itemRows = cartItems
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;color:#334155;font-size:14px;border-bottom:1px solid #f1f5f9;">
          ${i.title} <span style="color:#94a3b8;">× ${i.quantity}</span>
        </td>
        <td style="padding:12px 0;color:#334155;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;">
          ₹${(i.price * i.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemText = cartItems.map((i) => `  ${i.title} × ${i.quantity}  ₹${(i.price * i.quantity).toFixed(2)}`).join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <tr>
          <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:36px 40px;text-align:center;">
            <p style="margin:0;color:#fef3c7;font-size:32px;">🛒</p>
            <h1 style="margin:12px 0 0;color:#ffffff;font-size:22px;font-weight:700;">You left something behind</h1>
            <p style="margin:8px 0 0;color:#fde68a;font-size:14px;">${shopName}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 6px;color:#334155;font-size:16px;font-weight:600;">${greeting}</p>
            <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6;">
              You left some items in your cart. They&apos;re still waiting for you — complete your purchase before they sell out!
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td colspan="2" style="border-bottom:2px solid #e2e8f0;padding-bottom:10px;">
                  <p style="margin:0;color:#1e293b;font-size:14px;font-weight:600;">Your cart</p>
                </td>
              </tr>
              ${itemRows}
              <tr>
                <td style="padding:14px 0 0;color:#1e293b;font-size:15px;font-weight:700;">Subtotal</td>
                <td style="padding:14px 0 0;color:#d97706;font-size:16px;font-weight:700;text-align:right;">₹${subtotal.toFixed(2)}</td>
              </tr>
            </table>

            <div style="text-align:center;">
              <a href="${recoveryUrl}" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:-0.2px;">
                Complete My Purchase →
              </a>
            </div>

            <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;">
              If you didn&apos;t intend to shop, you can ignore this email.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} ${shopName}. Powered by Shop Editor.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: "Shop Editor <onboarding@resend.dev>",
    to: customerEmail,
    subject: `You left something in your cart — ${shopName}`,
    html,
    text: `${greeting}\n\nYou left some items in your cart at ${shopName}:\n\n${itemText}\n\nSubtotal: ₹${subtotal.toFixed(2)}\n\nComplete your purchase: ${recoveryUrl}\n\n— ${shopName}`,
  });
}
