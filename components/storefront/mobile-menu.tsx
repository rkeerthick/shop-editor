"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface Page {
  title: string;
  slug: string;
  isHome: boolean;
}

export function MobileMenu({ shopSlug, pages }: { shopSlug: string; pages: Page[] }) {
  const [open, setOpen] = useState(false);

  // Close on route change / escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger button — only on mobile */}
      <button
        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out sm:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
          <a
            href={`/store/${shopSlug}`}
            className="font-bold text-lg text-slate-900"
            onClick={() => setOpen(false)}
          >
            Menu
          </a>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-3 py-4 gap-1 flex-1 overflow-y-auto">
          {pages.map((page) => (
            <a
              key={page.slug}
              href={page.isHome ? `/store/${shopSlug}` : `/store/${shopSlug}/${page.slug}`}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
            >
              {page.title}
            </a>
          ))}
          <a
            href={`/store/${shopSlug}/track`}
            onClick={() => setOpen(false)}
            className="px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 text-sm transition-colors"
          >
            Track order
          </a>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">Powered by Shop Editor</p>
        </div>
      </div>
    </>
  );
}
