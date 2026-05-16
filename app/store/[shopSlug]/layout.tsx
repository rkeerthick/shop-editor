import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CartIcon } from "@/components/storefront/cart-icon";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;

  const shop = await db.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop || !shop.isActive) notFound();

  const pages = await db.storefrontPage.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "asc" },
    select: { title: true, slug: true, isHome: true },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href={`/store/${shopSlug}`} className="font-bold text-lg shrink-0">{shop.name}</a>
          <nav className="flex items-center gap-5 text-sm overflow-x-auto">
            {pages.map((page) => (
              <a
                key={page.slug}
                href={page.isHome ? `/store/${shopSlug}` : `/store/${shopSlug}/${page.slug}`}
                className="text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
              >
                {page.title}
              </a>
            ))}
            <CartIcon shopSlug={shopSlug} />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {shop.name}. Powered by Shop Editor.
      </footer>
    </div>
  );
}
