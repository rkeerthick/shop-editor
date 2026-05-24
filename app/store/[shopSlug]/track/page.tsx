import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TrackForm } from "@/components/storefront/track-form";

const STATUS_STEPS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING:    "Order placed",
  PAID:       "Payment confirmed",
  PROCESSING: "Processing",
  SHIPPED:    "Shipped",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
  REFUNDED:   "Refunded",
};

export default async function TrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ orderId?: string; email?: string }>;
}) {
  const { shopSlug } = await params;
  const { orderId, email } = await searchParams;

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop || !shop.isActive) notFound();

  let order = null;
  let lookupError = "";

  if (orderId && email) {
    order = await db.order.findFirst({
      where: {
        id: orderId,
        shopId: shop.id,
        customer: { email: { equals: email, mode: "insensitive" } },
      },
      include: {
        items: { include: { product: { select: { title: true, images: true } } } },
        customer: { select: { name: true, email: true } },
      },
    });
    if (!order) lookupError = "No order found with that ID and email. Please check and try again.";
  }

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Track your order</h1>
        <p className="text-slate-500">Enter your order ID and email to see your order status.</p>
      </div>

      <TrackForm shopSlug={shopSlug} initialOrderId={orderId ?? ""} initialEmail={email ?? ""} error={lookupError} />

      {order && (
        <div className="mt-10 space-y-6">
          {/* Status timeline */}
          {!["CANCELLED", "REFUNDED"].includes(order.status) ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-6">Order status</h2>
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                            done
                              ? "brand-bg border-transparent text-white"
                              : "border-slate-200 text-slate-300 bg-white"
                          } ${active ? "ring-4 ring-offset-2" : ""}`}
                          style={active ? { outline: "3px solid var(--brand)", outlineOffset: "2px" } : {}}
                        >
                          {done ? "✓" : i + 1}
                        </div>
                        <span className={`text-xs mt-1.5 text-center w-16 leading-tight ${done ? "brand-text font-medium" : "text-slate-400"}`}>
                          {STATUS_LABELS[step]}
                        </span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < currentStep ? "brand-bg" : "bg-slate-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
              <p className="text-red-600 font-semibold">{STATUS_LABELS[order.status]}</p>
            </div>
          )}

          {/* Order details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Order details</h2>
              <span className="text-xs text-slate-400 font-mono">{order.id.slice(0, 16)}…</span>
            </div>
            <div className="space-y-3 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.images[0]} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">📦</div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{item.product.title}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-1">
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>−₹{Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span>₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Placed date */}
          <p className="text-center text-xs text-slate-400">
            Order placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      )}
    </div>
  );
}
