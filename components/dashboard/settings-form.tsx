"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Shop } from "@prisma/client";

type FontStyle = "modern" | "classic" | "minimal";
type ButtonStyle = "rounded" | "pill" | "sharp";

const FONT_OPTIONS: { value: FontStyle; label: string; preview: string }[] = [
  { value: "modern",  label: "Modern",  preview: "font-sans" },
  { value: "classic", label: "Classic", preview: "font-serif" },
  { value: "minimal", label: "Minimal", preview: "font-sans tracking-widest" },
];

const BUTTON_OPTIONS: { value: ButtonStyle; label: string; radius: string }[] = [
  { value: "rounded", label: "Rounded", radius: "rounded-lg" },
  { value: "pill",    label: "Pill",    radius: "rounded-full" },
  { value: "sharp",   label: "Sharp",   radius: "rounded-none" },
];

const PRESET_COLORS = [
  { label: "Indigo",  value: "#6366f1" },
  { label: "Violet",  value: "#7c3aed" },
  { label: "Rose",    value: "#e11d48" },
  { label: "Orange",  value: "#ea580c" },
  { label: "Emerald", value: "#059669" },
  { label: "Sky",     value: "#0284c7" },
  { label: "Slate",   value: "#475569" },
  { label: "Black",   value: "#0f172a" },
];

function getTheme(raw: unknown) {
  if (!raw || typeof raw !== "object") return {};
  return raw as Record<string, string>;
}

export function SettingsForm({ shop }: { shop: Shop }) {
  const theme = getTheme(shop.theme);

  const [name, setName] = useState(shop.name);
  const [slug, setSlug] = useState(shop.slug);
  const [description, setDescription] = useState(shop.description ?? "");
  const [logoUrl, setLogoUrl] = useState(shop.logoUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(shop.bannerUrl ?? "");
  const [isActive, setIsActive] = useState(shop.isActive);
  const [accentColor, setAccentColor] = useState(theme.accentColor ?? "#6366f1");
  const [fontStyle, setFontStyle] = useState<FontStyle>((theme.fontStyle as FontStyle) ?? "modern");
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>((theme.buttonStyle as ButtonStyle) ?? "rounded");
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
        theme: { accentColor, fontStyle, buttonStyle },
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

    if (json.data.slug !== shop.slug) {
      window.location.href = "/dashboard/settings";
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{error}</p>}

      {/* Basic info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="font-semibold text-slate-800">Shop details</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Shop name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Shop" required minLength={2} />
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
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell customers about your shop…" rows={3} maxLength={500} />
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
        <h2 className="font-semibold text-slate-800">Branding</h2>
        <div className="space-y-2">
          <Label>Logo</Label>
          <ImageUpload value={logoUrl} onChange={setLogoUrl} onRemove={() => setLogoUrl("")} label="Click to upload logo" aspectRatio="square" />
        </div>
        <div className="space-y-2">
          <Label>Banner</Label>
          <ImageUpload value={bannerUrl} onChange={setBannerUrl} onRemove={() => setBannerUrl("")} label="Click to upload banner" aspectRatio="wide" />
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
        <h2 className="font-semibold text-slate-800">Theme</h2>

        {/* Accent color */}
        <div className="space-y-3">
          <Label>Accent color</Label>
          <div className="flex items-center gap-3 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => setAccentColor(c.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${accentColor === c.value ? "border-slate-900 scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c.value }}
              />
            ))}
            <div className="flex items-center gap-2 ml-1">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border border-slate-200"
                title="Custom color"
              />
              <span className="text-xs text-slate-400 font-mono">{accentColor}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-500">Preview:</span>
            <span className="text-sm font-semibold px-4 py-1.5 text-white rounded-lg" style={{ backgroundColor: accentColor }}>
              Button
            </span>
            <span className="text-sm font-bold" style={{ color: accentColor }}>₹99.00</span>
          </div>
        </div>

        {/* Font style */}
        <div className="space-y-3">
          <Label>Font style</Label>
          <div className="flex gap-3">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFontStyle(f.value)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm transition-all ${fontStyle === f.value ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}
              >
                <span className={`block text-base mb-0.5 ${f.preview}`}>Aa</span>
                <span className="text-xs">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Button style */}
        <div className="space-y-3">
          <Label>Button style</Label>
          <div className="flex gap-3">
            {BUTTON_OPTIONS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => setButtonStyle(b.value)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm transition-all ${buttonStyle === b.value ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <span
                  className={`block text-xs px-3 py-1.5 bg-slate-800 text-white mb-1.5 mx-auto w-fit ${b.radius}`}
                >
                  Button
                </span>
                <span className={`text-xs ${buttonStyle === b.value ? "text-indigo-700" : "text-slate-500"}`}>{b.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Visibility</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded" />
          <span className="text-sm">
            Store is <strong>{isActive ? "open" : "closed"}</strong> — customers {isActive ? "can" : "cannot"} visit your storefront
          </span>
        </label>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved!" : "Save settings"}
      </Button>
    </form>
  );
}
