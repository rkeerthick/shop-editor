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
            <NavLink href="/dashboard/settings">Settings</NavLink>
          </nav>
          <div className="mt-auto px-2">
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
