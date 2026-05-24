"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton({ shopSlug }: { shopSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/customer/logout", { method: "POST" });
    router.push(`/store/${shopSlug}`);
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
