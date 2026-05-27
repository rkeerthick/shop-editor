import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomNav } from "@/components/dashboard/bottom-nav";

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
    <div className="min-h-screen flex bg-slate-50">
      {shop && (
        <Sidebar
          shopName={shop.name}
          shopSlug={shop.slug}
          email={session.user?.email ?? ""}
        />
      )}
      <main className="flex-1 overflow-auto flex flex-col">
        {shop && <DashboardHeader shopId={shop.id} />}
        <div className="p-4 md:p-8 pb-20 md:pb-8 flex-1">{children}</div>
      </main>
      {shop && <BottomNav />}
    </div>
  );
}
