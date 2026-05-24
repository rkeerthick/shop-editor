"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Pencil, Check, X } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
}

interface VariantsSectionProps {
  productId: string;
  initialVariants: Variant[];
}

const EMPTY_FORM = { name: "", price: "", stock: "0", sku: "" };

export function VariantsSection({ productId, initialVariants }: VariantsSectionProps) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.price) { setError("Price is required"); return; }
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/products/${productId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        sku: form.sku.trim() || undefined,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error ?? "Something went wrong"); return; }
    setVariants((prev) => [...prev, { ...json.data, price: Number(json.data.price) }]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function startEdit(v: Variant) {
    setEditingId(v.id);
    setEditForm({ name: v.name, price: String(v.price), stock: String(v.stock), sku: v.sku ?? "" });
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    const res = await fetch(`/api/products/${productId}/variants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name.trim(),
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock) || 0,
        sku: editForm.sku.trim() || null,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) return;
    setVariants((prev) => prev.map((v) => v.id === id ? { ...v, ...json.data, price: Number(json.data.price) } : v));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/products/${productId}/variants/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) setVariants((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Variants</h2>
          <p className="text-xs text-slate-500 mt-0.5">e.g. sizes, colours, materials</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => { setShowForm(true); setError(null); }}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Plus className="w-4 h-4" /> Add variant
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="border border-indigo-100 bg-indigo-50/40 rounded-lg p-4 space-y-3">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-600">Name *</label>
              <input
                className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Small / Red / Cotton"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Price (₹) *</label>
              <input
                type="number" min="0" step="0.01"
                className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Stock</label>
              <input
                type="number" min="0"
                className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-600">SKU <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="SKU-001"
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError(null); }}
              className="px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Variants table */}
      {variants.length > 0 && (
        <div className="border border-slate-100 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Price</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Stock</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500 hidden sm:table-cell">SKU</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v) =>
                editingId === v.id ? (
                  <tr key={v.id} className="border-t border-slate-100 bg-indigo-50/30">
                    <td className="px-3 py-2">
                      <input
                        className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number" min="0" step="0.01"
                        className="w-24 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editForm.price}
                        onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number" min="0"
                        className="w-20 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editForm.stock}
                        onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
                      />
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <input
                        className="w-full border border-slate-200 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editForm.sku}
                        onChange={(e) => setEditForm((f) => ({ ...f, sku: e.target.value }))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(v.id)}
                          disabled={saving}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{v.name}</td>
                    <td className="px-4 py-3 text-slate-600">₹{v.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-600">{v.stock}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs hidden sm:table-cell">{v.sku ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => startEdit(v)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v.id)}
                          disabled={deletingId === v.id}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          {deletingId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {variants.length === 0 && !showForm && (
        <p className="text-sm text-slate-400">No variants yet. Add one to offer different options.</p>
      )}
    </div>
  );
}
