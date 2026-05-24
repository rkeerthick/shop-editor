"use client";

import { useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="w-full aspect-square rounded-2xl bg-slate-100" />;
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[activeIndex]}
        alt={title}
        className="w-full aspect-square object-cover rounded-2xl bg-slate-100 transition-opacity duration-200"
      />

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? "border-transparent ring-2 ring-offset-1 brand-border opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              style={i === activeIndex ? { outline: "2px solid var(--brand)", outlineOffset: "2px" } : {}}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${title} view ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
