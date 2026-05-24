import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { OrderStatusSelect } from "@/components/dashboard/order-status-select";
import type { OrderStatus } from "@prisma/client";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:    "bg-yellow-100 text-yellow-800",
  PAID:       "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED:    "bg-orange-100 text-orange-800",
  DELIVERED:  "bg-green-100 text-green-800",
  CANCELLED:  "bg-red-100 text-red-800",
  REFUNDED:   "bg-gray-100 text-gray-700",
};

export default async function OrderDetailPage({
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
          product: { select: { title: true, images: true } },
          variant: { select: { name: true } },
        },
      },
    },
  });
  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string> | null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/orders" className="text-sm text-muted-foreground hover:text-foreground">
          ← Orders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-mono font-medium">#{order.id.slice(-8).toUpperCase()}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[order.status]}`}>
            {order.status}
          </span>
          <Link
            href={`/dashboard/orders/${order.id}/invoice`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Invoice ↗
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Customer */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Customer</h2>
          <p className="font-medium">{order.customer.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{order.customer.email}</p>
          {order.customer.phone && <p className="text-sm text-muted-foreground">{order.customer.phone}</p>}
        </div>

        {/* Shipping address */}
        {address && (
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Shipping Address</h2>
            <p className="text-sm">{address.line1}</p>
            <p className="text-sm">{address.city}, {address.state} {address.postal_code}</p>
            <p className="text-sm">{address.country}</p>
          </div>
        )}
      </div>

      {/* Line items */}
      <div className="bg-white border rounded-lg overflow-hidden mb-6">
        <h2 className="text-sm font-semibold p-4 border-b text-muted-foreground uppercase tracking-wide">Items</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                    {item.product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.product.title}</p>
                    {item.variant && <p className="text-xs text-muted-foreground">{item.variant.name}</p>}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">× {item.quantity}</td>
                <td className="px-4 py-3 text-right">₹{Number(item.unitPrice).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium">
                  ₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t bg-gray-50 text-sm">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Subtotal</td>
              <td className="px-4 py-2 text-right">₹{Number(order.subtotal).toFixed(2)}</td>
            </tr>
            {Number(order.discountAmount) > 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right text-green-600">Discount</td>
                <td className="px-4 py-2 text-right text-green-600">−₹{Number(order.discountAmount).toFixed(2)}</td>
              </tr>
            )}
            {Number(order.shippingAmount) > 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">
                  Shipping{order.shippingRateName ? ` (${order.shippingRateName})` : ""}
                </td>
                <td className="px-4 py-2 text-right">₹{Number(order.shippingAmount).toFixed(2)}</td>
              </tr>
            )}
            <tr className="border-t">
              <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total</td>
              <td className="px-4 py-3 text-right font-bold text-lg">₹{Number(order.total).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Status update */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Update Status</h2>
        <OrderStatusSelect orderId={order.id} current={order.status} />
      </div>
    </div>
  );
}
