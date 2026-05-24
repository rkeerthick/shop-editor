"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
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
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-4 py-3 font-medium text-slate-500 w-8" />
            <th className="text-left px-4 py-3 font-medium text-slate-500">Product</th>
            <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Category</th>
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
                {/* Product row */}
                <tr
                  key={p.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isOpen ? "bg-slate-50" : ""}`}
                >
                  {/* Expand toggle */}
                  <td className="px-4 py-3">
                    {hasVariants ? (
                      <button
                        onClick={() => toggle(p.id)}
                        className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                        aria-label={isOpen ? "Collapse variants" : "Expand variants"}
                      >
                        {isOpen
                          ? <ChevronDown className="w-3.5 h-3.5" />
                          : <ChevronRight className="w-3.5 h-3.5" />}
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
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
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

                {/* Variant rows */}
                {isOpen && p.variants.map((v, i) => (
                  <tr
                    key={v.id}
                    className={`border-b border-slate-100 bg-indigo-50/40 transition-colors hover:bg-indigo-50/70 ${
                      i === p.variants.length - 1 ? "border-b-2 border-indigo-100" : ""
                    }`}
                  >
                    {/* Indent marker */}
                    <td className="px-4 py-2">
                      <div className="w-6 h-full flex items-center justify-center">
                        <div className="w-px h-4 bg-slate-300 mx-auto" />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      <div className="flex items-center gap-2 pl-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        <span className="font-medium text-slate-700">{v.name}</span>
                        {v.sku && (
                          <span className="text-xs text-slate-400 font-mono">{v.sku}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 hidden sm:table-cell" />
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
  );
}
