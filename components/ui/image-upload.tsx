"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  aspectRatio?: "square" | "wide";
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = "Upload image",
  aspectRatio = "square",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const text = await res.text();
    setUploading(false);

    if (!res.ok) {
      let message = "Upload failed";
      try { message = JSON.parse(text).error ?? message; } catch { /* empty body */ }
      setError(message);
      return;
    }

    const json = JSON.parse(text);

    onChange(json.data.url);
    // reset so same file can be re-selected
    e.target.value = "";
  }

  const containerClass =
    aspectRatio === "wide"
      ? "w-full h-36"
      : "w-32 h-32";

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`${containerClass} rounded-lg border-2 border-dashed border-gray-200 overflow-hidden relative bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors flex items-center justify-center`}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground">{uploading ? "Uploading…" : label}</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-muted-foreground">
            Uploading…
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          {value ? "Change" : "Upload"}
        </button>
        {value && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-500 hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
