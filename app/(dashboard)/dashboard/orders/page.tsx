import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
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

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const orders = await db.order.findMany({
    where: { shopId: shop.id },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Orders</h1>
      <p className="text-muted-foreground mb-6">View and manage customer orders.</p>

      {orders.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center text-muted-foreground">
          No orders yet. Share your store to start receiving orders!
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Items</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/orders/${order.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      #{order.id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customer.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </td>
                  <td className="px-4 py-3 font-medium">₹{Number(order.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
