import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewPageButton } from "@/components/editor/new-page-button";

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Storefront</h1>
          <p className="text-muted-foreground text-sm">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
        </div>
        <NewPageButton shopId={shop.id} />
      </div>

      {pages.length === 0 ? (
        <div className="border rounded-lg bg-white p-12 text-center">
          <p className="text-muted-foreground mb-4">No pages yet. Create your homepage to get started.</p>
          <NewPageButton shopId={shop.id} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <div key={page.id} className="bg-white border rounded-lg p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{page.title}</p>
                  <p className="text-xs text-muted-foreground">/{page.slug}</p>
                </div>
                {page.isHome && <Badge variant="secondary">Home</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{page._count.blocks} block{page._count.blocks !== 1 ? "s" : ""}</p>
              <Link
                href={`/dashboard/storefront/${page.id}/editor`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-auto")}
              >
                Edit page
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
