"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewPageButton({ shopId }: { shopId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isHome, setIsHome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(v: string) {
    setTitle(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  async function handleCreate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/storefront/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId, title, slug, isHome }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "Something went wrong"); return; }
    setOpen(false);
    setTitle(""); setSlug(""); setIsHome(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>New page</Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="font-semibold text-lg">New page</h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Home" />
        </div>
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="home" />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isHome} onChange={(e) => setIsHome(e.target.checked)} />
          Set as homepage
        </label>
        <div className="flex gap-2 pt-1">
          <Button onClick={handleCreate} disabled={loading || !title || !slug} className="flex-1">
            {loading ? "Creating…" : "Create"}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
