"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, FolderOpen, X, Check, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number;
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState("");

  function openCreate() {
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setFormParentId("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormParentId(cat.parentId ?? "");
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleSave() {
    if (!formName.trim()) { setError("Name is required"); return; }
    if (!formSlug.trim()) { setError("Slug is required"); return; }

    setSaving(true);
    setError(null);

    const body = {
      name: formName.trim(),
      slug: formSlug.trim(),
      ...(formParentId ? { parentId: formParentId } : {}),
    };

    const res = editingId
      ? await fetch(`/api/categories/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) { setError(json.error ?? "Something went wrong"); return; }

    if (editingId) {
      setCategories((prev) => prev.map((c) => c.id === editingId ? { ...c, ...body } : c));
    } else {
      setCategories((prev) => [...prev, { ...json.data, productCount: 0 }]);
    }
    closeForm();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }

  const parentOptions = categories.filter((c) => c.id !== editingId);

  return (
    <div className="space-y-4">
      {/* Create button */}
      {!showForm && (
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add category
        </button>
      )}

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">{editingId ? "Edit category" : "New category"}</h2>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-sm text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Electronics"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editingId) setFormSlug(toSlug(e.target.value));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Slug</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="electronics"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5 mb-5">
            <label className="text-sm font-medium text-slate-700">Parent category <span className="text-slate-400 font-normal">(optional)</span></label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={formParentId}
              onChange={(e) => setFormParentId(e.target.value)}
            >
              <option value="">None (top-level)</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? "Saving…" : editingId ? "Save changes" : "Create"}
            </button>
            <button
              onClick={closeForm}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      {categories.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl py-16 text-center">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No categories yet</p>
          <p className="text-sm text-slate-400 mt-1">Create a category to organise your products</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 hidden sm:table-cell">Slug</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 hidden sm:table-cell">Parent</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Products</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const parent = categories.find((c) => c.id === cat.parentId);
                return (
                  <tr key={cat.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{cat.name}</td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-xs hidden sm:table-cell">{cat.slug}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{parent?.name ?? <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-right text-slate-500">{cat.productCount}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={deletingId === cat.id}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
