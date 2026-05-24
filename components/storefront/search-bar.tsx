"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({ shopSlug }: { shopSlug: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function openSearch() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/store/${shopSlug}/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <button onClick={openSearch} aria-label="Search" className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24 px-4" onClick={() => setOpen(false)}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex items-center gap-3 px-4 py-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              ref={inputRef}
              className="flex-1 text-sm outline-none"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-xs">
              Esc
            </button>
          </form>
        </div>
      )}
    </>
  );
}
