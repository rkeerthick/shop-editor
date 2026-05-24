import { db } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-session";
import { notFound, redirect } from "next/navigation";
import { LogoutButton } from "@/components/storefront/logout-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:    "Pending",
  PAID:       "Paid",
  PROCESSING: "Processing",
  SHIPPED:    "Shipped",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
  REFUNDED:   "Refunded",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "bg-yellow-100 text-yellow-800",
  PAID:       "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED:    "bg-orange-100 text-orange-800",
  DELIVERED:  "bg-green-100 text-green-800",
  CANCELLED:  "bg-red-100 text-red-800",
  REFUNDED:   "bg-gray-100 text-gray-700",
};

export default async function CustomerAccountPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;

  const session = await getCustomerSession();
  if (!session) redirect(`/store/${shopSlug}/account/login`);

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop || !shop.isActive) notFound();

  const account = await db.customerAccount.findUnique({ where: { id: session.id } });
  if (!account) redirect(`/store/${shopSlug}/account/login`);

  // Orders linked by matching email across Customer records
  const orders = await db.order.findMany({
    where: {
      shopId: shop.id,
      customer: { email: account.email },
    },
    include: {
      items: {
        include: { product: { select: { title: true, images: true } } },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My account</h1>
          <p className="text-sm text-slate-500 mt-0.5">{account.name ?? account.email}</p>
        </div>
        <LogoutButton shopSlug={shopSlug} />
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4">Order history</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl">
          <p className="text-slate-400 text-sm">No orders yet.</p>
          <a
            href={`/store/${shopSlug}`}
            className="mt-3 inline-block text-sm brand-text font-medium hover:underline"
          >
            Start shopping →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Order</p>
                  <p className="font-mono font-semibold text-slate-800 text-sm">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Date</p>
                  <p className="text-sm text-slate-700">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Total</p>
                  <p className="text-sm font-bold text-slate-800">₹{Number(order.total).toFixed(2)}</p>
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>

              {/* Item previews */}
              <div className="px-5 py-4 flex flex-wrap items-center gap-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      {item.product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 max-w-[120px] truncate">{item.product.title}</p>
                  </div>
                ))}
                {order.items.length === 3 && (
                  <p className="text-xs text-slate-400">+more</p>
                )}
              </div>

              {/* Track link */}
              <div className="px-5 pb-4">
                <a
                  href={`/store/${shopSlug}/track?orderId=${order.id}`}
                  className="text-xs brand-text font-medium hover:underline"
                >
                  Track order →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
