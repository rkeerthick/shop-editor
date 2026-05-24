import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CartIcon } from "@/components/storefront/cart-icon";
import { SearchBar } from "@/components/storefront/search-bar";
import { MobileMenu } from "@/components/storefront/mobile-menu";
import { AccountIcon } from "@/components/storefront/account-icon";
import Script from "next/script";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const FONTS: Record<string, string> = {
  modern:  "'Inter', system-ui, -apple-system, sans-serif",
  classic: "Georgia, 'Palatino Linotype', 'Book Antiqua', serif",
  minimal: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const BTN_RADIUS: Record<string, string> = {
  rounded: "0.625rem",
  pill:    "9999px",
  sharp:   "0px",
};

function getTheme(raw: unknown) {
  if (!raw || typeof raw !== "object") return {};
  return raw as Record<string, string>;
}

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

  const theme = getTheme(shop.theme);
  const accentColor = theme.accentColor ?? "#6366f1";
  const fontFamily = FONTS[theme.fontStyle ?? "modern"] ?? FONTS.modern;
  const btnRadius = BTN_RADIUS[theme.buttonStyle ?? "rounded"] ?? BTN_RADIUS.rounded;

  const pages = await db.storefrontPage.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "asc" },
    select: { title: true, slug: true, isHome: true },
  });

  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      style={{ fontFamily, "--brand": accentColor, "--btn-radius": btnRadius } as React.CSSProperties}
    >
      {GTM_ID && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}
      {/* Inject CSS variables for dynamic theming */}
      <style>{`
        :root {
          --brand: ${accentColor};
          --btn-radius: ${btnRadius};
        }
        .store-btn {
          background-color: var(--brand);
          border-radius: var(--btn-radius);
        }
        .store-btn:hover {
          opacity: 0.9;
        }
        .brand-text { color: var(--brand); }
        .brand-bg   { background-color: var(--brand); }
        .brand-border { border-color: var(--brand); }
      `}</style>

      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-17 flex items-center justify-between gap-6">

          {/* Left: hamburger (mobile only) + logo */}
          <div className="flex items-center gap-3 shrink-0">
            <MobileMenu shopSlug={shopSlug} pages={pages} />
            <a
              href={`/store/${shopSlug}`}
              className="font-bold text-lg text-slate-900 tracking-tight hover:opacity-70 transition-opacity"
            >
              {shop.name}
            </a>
          </div>

          {/* Centre: desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm flex-1">
            {pages.map((page) => (
              <a
                key={page.slug}
                href={page.isHome ? `/store/${shopSlug}` : `/store/${shopSlug}/${page.slug}`}
                className="text-slate-500 hover:text-slate-900 whitespace-nowrap transition-colors font-medium"
              >
                {page.title}
              </a>
            ))}
            <a
              href={`/store/${shopSlug}/track`}
              className="text-slate-500 hover:text-slate-900 whitespace-nowrap transition-colors font-medium"
            >
              Track order
            </a>
          </nav>

          {/* Right: icon cluster */}
          <div className="flex items-center gap-1">
            <SearchBar shopSlug={shopSlug} />
            <AccountIcon shopSlug={shopSlug} />
            <CartIcon shopSlug={shopSlug} />
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
