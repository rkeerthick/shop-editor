import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewPageButton } from "@/components/editor/new-page-button";
import { Paintbrush } from "lucide-react";

export default async function StorefrontPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const pages = await db.storefrontPage.findMany({
    where: { shopId: shop.id },
    include: { _count: { select: { blocks: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Storefront</h1>
        <p className="text-sm text-slate-500 mt-1">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
      </div>

      {pages.length === 0 ? (
        /* Empty state — single button inside the card */
        <div className="bg-white border border-dashed border-slate-200 rounded-xl py-16 text-center">
          <Paintbrush className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No pages yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">Create your homepage to get started</p>
          <NewPageButton shopId={shop.id} />
        </div>
      ) : (
        /* List view — New page button in the card header */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-medium text-slate-600">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
            <NewPageButton shopId={shop.id} size="sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {pages.map((page) => (
              <div key={page.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-800">{page.title}</p>
                    <p className="text-xs text-slate-400 font-mono">/{page.slug}</p>
                  </div>
                  {page.isHome && <Badge variant="secondary">Home</Badge>}
                </div>
                <p className="text-xs text-slate-400">{page._count.blocks} block{page._count.blocks !== 1 ? "s" : ""}</p>
                <Link
                  href={`/dashboard/storefront/${page.id}/editor`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-auto")}
                >
                  Edit page
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
