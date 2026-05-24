"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import type { ShippingRate } from "@prisma/client";

interface RateForm {
  name: string;
  price: string;
  estimatedDays: string;
}

const EMPTY_FORM: RateForm = { name: "", price: "", estimatedDays: "" };

export function ShippingRatesClient({ initialRates }: { initialRates: ShippingRate[] }) {
  const [rates, setRates] = useState(initialRates);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RateForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<RateForm>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/shipping-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, price: parseFloat(form.price) || 0, estimatedDays: form.estimatedDays || undefined }),
    });
    const json = await res.json();
    if (res.ok) {
      setRates((r) => [...r, json.data].sort((a, b) => Number(a.price) - Number(b.price)));
      setForm(EMPTY_FORM);
      setShowForm(false);
    }
    setSaving(false);
  }

  function startEdit(rate: ShippingRate) {
    setEditId(rate.id);
    setEditForm({ name: rate.name, price: String(Number(rate.price)), estimatedDays: rate.estimatedDays ?? "" });
  }

  async function handleEdit(id: string) {
    setSaving(true);
    const res = await fetch(`/api/shipping-rates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editForm.name, price: parseFloat(editForm.price) || 0, estimatedDays: editForm.estimatedDays || null }),
    });
    const json = await res.json();
    if (res.ok) {
      setRates((r) => r.map((x) => x.id === id ? json.data : x).sort((a, b) => Number(a.price) - Number(b.price)));
      setEditId(null);
    }
    setSaving(false);
  }

  async function toggleActive(rate: ShippingRate) {
    const res = await fetch(`/api/shipping-rates/${rate.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !rate.isActive }),
    });
    const json = await res.json();
    if (res.ok) setRates((r) => r.map((x) => x.id === rate.id ? json.data : x));
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/shipping-rates/${id}`, { method: "DELETE" });
    if (res.ok) setRates((r) => r.filter((x) => x.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      {/* Rate list */}
      {rates.length === 0 && !showForm && (
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-muted-foreground">
          No shipping rates yet. Add one below so customers can choose at checkout.
        </div>
      )}

      {rates.map((rate) => (
        <div key={rate.id} className={`bg-white border rounded-xl p-4 ${!rate.isActive ? "opacity-60" : ""}`}>
          {editId === rate.id ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Estimated delivery (optional)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. 3–5 business days"
                  value={editForm.estimatedDays}
                  onChange={(e) => setEditForm((f) => ({ ...f, estimatedDays: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(rate.id)}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => setEditId(null)} className="flex items-center gap-1.5 px-3 py-1.5 border text-sm rounded-lg hover:bg-slate-50">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{rate.name}</p>
                  {!rate.isActive && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
                {rate.estimatedDays && (
                  <p className="text-xs text-muted-foreground mt-0.5">{rate.estimatedDays}</p>
                )}
              </div>
              <p className="font-bold text-slate-900">
                {Number(rate.price) === 0 ? "Free" : `₹${Number(rate.price).toFixed(2)}`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(rate)}
                  title={rate.isActive ? "Disable" : "Enable"}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 text-xs"
                >
                  {rate.isActive ? "Disable" : "Enable"}
                </button>
                <button onClick={() => startEdit(rate)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(rate.id)}
                  disabled={deletingId === rate.id}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add form */}
      {showForm ? (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-800">New shipping rate</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
              <input
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Standard Delivery"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (₹) — enter 0 for free</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="50"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Estimated delivery (optional)</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="e.g. 3–5 business days"
              value={form.estimatedDays}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDays: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Add rate
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="px-4 py-2 border text-sm rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl text-sm text-muted-foreground hover:bg-slate-50 hover:border-slate-400 transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" /> Add shipping rate
        </button>
      )}
    </div>
  );
}
