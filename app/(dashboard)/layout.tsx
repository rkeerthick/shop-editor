import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });

  if (!shop && !pathname.startsWith("/dashboard/setup")) {
    redirect("/dashboard/setup");
  }

  return (
    <div className="min-h-screen flex">
      {shop && (
        <aside className="w-60 bg-white border-r flex flex-col py-6 px-4 gap-1 shrink-0">
          <div className="font-bold text-xl px-2 mb-1">Shop Editor</div>
          <p className="text-xs text-muted-foreground px-2 mb-5 truncate">{shop.name}</p>
          <nav className="flex flex-col gap-1">
            <NavLink href="/dashboard">Overview</NavLink>
            <NavLink href="/dashboard/products">Products</NavLink>
            <NavLink href="/dashboard/orders">Orders</NavLink>
            <NavLink href="/dashboard/storefront">Storefront</NavLink>
            <NavLink href="/dashboard/discounts">Discounts</NavLink>
            <NavLink href="/dashboard/settings">Settings</NavLink>
          </nav>
          <div className="mt-auto px-2">
            <a
              href={`/store/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full mb-3 px-3 py-1.5 rounded-md border text-sm text-muted-foreground hover:bg-gray-100 hover:text-foreground transition-colors"
            >
              <span>View Storefront</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <p className="text-xs text-muted-foreground truncate mb-2">{session.user?.email}</p>
            <form action="/api/auth/signout" method="POST">
              <Button variant="outline" size="sm" className="w-full" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </aside>
      )}
      <main className="flex-1 p-8 bg-gray-50 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-gray-100 hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  );
}
