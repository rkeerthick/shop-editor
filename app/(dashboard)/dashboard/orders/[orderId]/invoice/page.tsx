import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { PrintTrigger } from "@/components/dashboard/print-trigger";
import { InvoiceToolbar } from "@/components/dashboard/invoice-toolbar";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { orderId } = await params;

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const order = await db.order.findFirst({
    where: { id: orderId, shopId: shop.id },
    include: {
      customer: true,
      items: {
        include: {
          product: { select: { title: true } },
          variant: { select: { name: true } },
        },
      },
    },
  });
  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string> | null;
  const invoiceNo = `INV-${order.id.slice(-8).toUpperCase()}`;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <PrintTrigger />

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
        @page { size: A4; margin: 20mm; }
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #1e293b; background: #fff; }
      `}</style>

      <InvoiceToolbar invoiceNo={invoiceNo} orderId={orderId} />

      {/* Invoice body */}
      <div className="max-w-2xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-emerald-700 mb-1">{shop.name}</h1>
            <p className="text-slate-400 text-sm">Tax Invoice</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-slate-900">{invoiceNo}</p>
            <p className="text-sm text-slate-500 mt-1">{date}</p>
          </div>
        </div>

        {/* Bill to + order info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill To</p>
            <p className="font-semibold text-slate-900">{order.customer.name ?? "—"}</p>
            <p className="text-slate-600">{order.customer.email}</p>
            {order.customer.phone && <p className="text-slate-600">{order.customer.phone}</p>}
            {address && (
              <div className="mt-2 text-slate-600">
                <p>{address.line1}</p>
                <p>{address.city}{address.state ? `, ${address.state}` : ""} {address.postal_code}</p>
                <p>{address.country}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Order Info</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID</span>
                <span className="font-mono text-slate-700">{order.id.slice(-12).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-slate-700">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="text-slate-700">{date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full mb-6" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
              <th className="text-left py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Item</th>
              <th className="text-center py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">Qty</th>
              <th className="text-right py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">Unit Price</th>
              <th className="text-right py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td className="py-3 text-slate-800">
                  <p className="font-medium">{item.product.title}</p>
                  {item.variant && <p className="text-xs text-slate-400">{item.variant.name}</p>}
                </td>
                <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                <td className="py-3 text-right text-slate-600">₹{Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-3 text-right font-medium text-slate-800">
                  ₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-56 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal).toFixed(2)}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−₹{Number(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            {Number(order.shippingAmount) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping{order.shippingRateName ? ` (${order.shippingRateName})` : ""}</span>
                <span>₹{Number(order.shippingAmount).toFixed(2)}</span>
              </div>
            )}
            <div
              className="flex justify-between font-bold text-base text-slate-900 pt-2"
              style={{ borderTop: "2px solid #e2e8f0" }}
            >
              <span>Total</span>
              <span>₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e2e8f0" }} className="pt-6 text-center">
          <p className="text-slate-400 text-xs">Thank you for your purchase!</p>
          <p className="text-slate-300 text-xs mt-1">Powered by Shop Editor</p>
        </div>
      </div>
    </>
  );
}
