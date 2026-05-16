"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Shop } from "@prisma/client";

export function SettingsForm({ shop }: { shop: Shop }) {
  const [name, setName] = useState(shop.name);
  const [slug, setSlug] = useState(shop.slug);
  const [description, setDescription] = useState(shop.description ?? "");
  const [logoUrl, setLogoUrl] = useState(shop.logoUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(shop.bannerUrl ?? "");
  const [isActive, setIsActive] = useState(shop.isActive);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/shops/${shop.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        isActive,
      }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Failed to save settings");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // If slug changed, navigate to avoid stale URL
    if (json.data.slug !== shop.slug) {
      window.location.href = "/dashboard/settings";
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{error}</p>
      )}

      {/* Basic info */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold">Shop details</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Shop name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Shop"
            required
            minLength={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">
            Slug{" "}
            <span className="text-xs text-muted-foreground font-normal">
              — storefront URL: /store/<strong>{slug || "…"}</strong>
            </span>
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="my-shop"
            required
            minLength={2}
            maxLength={48}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description <span className="text-xs text-muted-foreground font-normal">optional</span></Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell customers about your shop…"
            rows={3}
            maxLength={500}
          />
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white border rounded-lg p-6 space-y-6">
        <h2 className="font-semibold">Branding</h2>
        <div className="space-y-2">
          <Label>Logo</Label>
          <ImageUpload
            value={logoUrl}
            onChange={setLogoUrl}
            onRemove={() => setLogoUrl("")}
            label="Click to upload logo"
            aspectRatio="square"
          />
        </div>
        <div className="space-y-2">
          <Label>Banner</Label>
          <ImageUpload
            value={bannerUrl}
            onChange={setBannerUrl}
            onRemove={() => setBannerUrl("")}
            label="Click to upload banner"
            aspectRatio="wide"
          />
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-white border rounded-lg p-6 space-y-3">
        <h2 className="font-semibold">Visibility</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm">
            Store is <strong>{isActive ? "open" : "closed"}</strong> — customers{" "}
            {isActive ? "can" : "cannot"} visit your storefront
          </span>
        </label>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved!" : "Save settings"}
      </Button>
    </form>
  );
}
