import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CartIcon } from "@/components/storefront/cart-icon";
import { SearchBar } from "@/components/storefront/search-bar";

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
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href={`/store/${shopSlug}`}
            className="font-bold text-xl text-slate-900 shrink-0 tracking-tight hover:text-indigo-600 transition-colors"
          >
            {shop.name}
          </a>
          <div className="flex items-center gap-8">
            <nav className="hidden sm:flex items-center gap-6 text-sm">
              {pages.map((page) => (
                <a
                  key={page.slug}
                  href={page.isHome ? `/store/${shopSlug}` : `/store/${shopSlug}/${page.slug}`}
                  className="text-slate-500 hover:text-slate-900 whitespace-nowrap transition-colors font-medium"
                >
                  {page.title}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <SearchBar shopSlug={shopSlug} />
              <CartIcon shopSlug={shopSlug} />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-100 bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <span className="font-semibold text-slate-700">{shop.name}</span>
          <span>© {new Date().getFullYear()} {shop.name}. Powered by Shop Editor.</span>
        </div>
      </footer>
    </div>
  );
}
