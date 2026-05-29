"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
}

interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  isActive: boolean;
  category: string | null;
  variants: Variant[];
}

export function ProductsTable({ products }: { products: Product[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <>
      {/* ── Mobile card layout ── */}
      <div className="sm:hidden divide-y divide-slate-100">
        {products.map((p) => {
          const isOpen = expanded.has(p.id);
          const hasVariants = p.variants.length > 0;
          return (
            <div key={p.id} className="px-4 py-3.5">
              {/* Row: title + badge + edit */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  {hasVariants && (
                    <button
                      onClick={() => toggle(p.id)}
                      className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 shrink-0"
                    >
                      {isOpen
                        ? <ChevronDown className="w-3.5 h-3.5" />
                        : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <span className="font-medium text-slate-800 truncate">{p.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={p.isActive ? "default" : "secondary"}>
                    {p.isActive ? "Active" : "Draft"}
                  </Badge>
                  <Link
                    href={`/dashboard/products/${p.id}/edit`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Row: meta info */}
              <div className="flex items-center gap-4 text-xs text-slate-500 pl-7">
                <span>₹{p.price.toFixed(2)}</span>
                <span>{p.stock} in stock</span>
                {p.category && <span>{p.category}</span>}
                {hasVariants && (
                  <span className="text-slate-400">{p.variants.length} variant{p.variants.length !== 1 ? "s" : ""}</span>
                )}
              </div>

              {/* Expanded variants */}
              {isOpen && (
                <div className="mt-2 ml-7 space-y-1.5">
                  {p.variants.map((v) => (
                    <div key={v.id} className="flex items-center justify-between bg-emerald-50/60 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-700 truncate">{v.name}</span>
                        {v.sku && <span className="text-xs text-slate-400 font-mono">{v.sku}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0 ml-2">
                        <span>₹{v.price.toFixed(2)}</span>
                        <span>{v.stock} in stock</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop table layout ── */}
      <div className="hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-500 w-8" />
              <th className="text-left px-4 py-3 font-medium text-slate-500">Product</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Category</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Price</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isOpen = expanded.has(p.id);
              const hasVariants = p.variants.length > 0;
              return (
                <>
                  <tr
                    key={p.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isOpen ? "bg-slate-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      {hasVariants ? (
                        <button
                          onClick={() => toggle(p.id)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      ) : (
                        <span className="w-6 h-6 block" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {p.title}
                      {hasVariants && (
                        <span className="ml-2 text-xs text-slate-400 font-normal">
                          {p.variants.length} variant{p.variants.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.category ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-700">₹{p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-700">{p.stock}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.isActive ? "default" : "secondary"}>
                        {p.isActive ? "Active" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/products/${p.id}/edit`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>

                  {isOpen && p.variants.map((v, i) => (
                    <tr
                      key={v.id}
                      className={`border-b border-slate-100 bg-emerald-50/40 transition-colors hover:bg-emerald-50/70 ${
                        i === p.variants.length - 1 ? "border-b-2 border-emerald-100" : ""
                      }`}
                    >
                      <td className="px-4 py-2">
                        <div className="w-6 h-full flex items-center justify-center">
                          <div className="w-px h-4 bg-slate-300 mx-auto" />
                        </div>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        <div className="flex items-center gap-2 pl-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                          <span className="font-medium text-slate-700">{v.name}</span>
                          {v.sku && <span className="text-xs text-slate-400 font-mono">{v.sku}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2 text-slate-600">₹{v.price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-slate-600">{v.stock}</td>
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2" />
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
