"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLOCK_LABELS } from "@/types/blocks";
import type { EditorBlock } from "@/types/blocks";

interface BlockConfigPanelProps {
  block: EditorBlock;
  onChange: (props: Record<string, unknown>) => void;
}

export function BlockConfigPanel({ block, onChange }: BlockConfigPanelProps) {
  const p = block.props;

  function set(key: string, value: unknown) {
    onChange({ ...p, [key]: value });
  }

  function field(key: string, label: string, type: "text" | "url" | "color" | "number" = "text") {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{label}</Label>
        <Input
          type={type}
          value={String(p[key] ?? "")}
          onChange={(e) => set(key, type === "number" ? Number(e.target.value) : e.target.value)}
          className="h-7 text-xs"
        />
      </div>
    );
  }

  function textareaField(key: string, label: string) {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{label}</Label>
        <Textarea
          value={String(p[key] ?? "")}
          onChange={(e) => set(key, e.target.value)}
          rows={3}
          className="text-xs"
        />
      </div>
    );
  }

  function selectField(key: string, label: string, options: { value: string; label: string }[]) {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{label}</Label>
        <select
          value={String(p[key] ?? "")}
          onChange={(e) => set(key, e.target.value)}
          className="w-full h-7 text-xs border rounded-md px-2 bg-background"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  function checkboxField(key: string, label: string) {
    return (
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(p[key])}
          onChange={(e) => set(key, e.target.checked)}
          className="rounded"
        />
        {label}
      </label>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <p className="text-sm font-semibold">{BLOCK_LABELS[block.type]}</p>

      {block.type === "hero" && (<>
        {field("heading", "Heading")}
        {field("subheading", "Subheading")}
        {field("buttonText", "Button text")}
        {field("buttonLink", "Button link", "url")}
        {field("backgroundImage", "Background image URL", "url")}
      </>)}

      {block.type === "product-grid" && (<>
        {field("heading", "Heading")}
        {field("columns", "Columns", "number")}
        {field("limit", "Max products", "number")}
      </>)}

      {block.type === "banner" && (<>
        {field("text", "Banner text")}
        {field("backgroundColor", "Background color", "color")}
        {field("textColor", "Text color", "color")}
        {field("link", "Link URL", "url")}
      </>)}

      {block.type === "text" && (<>
        {field("heading", "Heading (optional)")}
        {textareaField("body", "Body text")}
        {selectField("alignment", "Alignment", [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ])}
      </>)}

      {block.type === "image" && (<>
        {field("src", "Image URL", "url")}
        {field("alt", "Alt text")}
        {field("caption", "Caption (optional)")}
        {checkboxField("fullWidth", "Full width")}
      </>)}

      {block.type === "cta" && (<>
        {field("heading", "Heading")}
        {field("subheading", "Subheading (optional)")}
        {field("buttonText", "Button text")}
        {field("buttonLink", "Button link", "url")}
        {selectField("variant", "Style", [
          { value: "dark", label: "Dark" },
          { value: "light", label: "Light" },
        ])}
      </>)}
    </div>
  );
}
