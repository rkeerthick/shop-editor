"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DiscountCode = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number | null;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  isActive: boolean;
};

export function DiscountsClient({ shopId, initialCodes }: { shopId: string; initialCodes: DiscountCode[] }) {
  const [codes, setCodes] = useState<DiscountCode[]>(initialCodes);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "",
    minOrder: "",
    usageLimit: "",
    expiresAt: "",
  });

  async function createCode() {
    if (!form.code || !form.value) return;
    setSaving(true);
    const res = await fetch("/api/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopId,
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
      }),
    });
    const { data } = await res.json();
    if (data) {
      setCodes((prev) => [{ ...data, value: Number(data.value), minOrder: data.minOrder ? Number(data.minOrder) : null }, ...prev]);
      setForm({ code: "", type: "PERCENTAGE", value: "", minOrder: "", usageLimit: "", expiresAt: "" });
      setShowForm(false);
    }
    setSaving(false);
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/discounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c)));
  }

  async function deleteCode(id: string) {
    await fetch(`/api/discounts/${id}`, { method: "DELETE" });
    setCodes((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discount Codes</h1>
          <p className="text-muted-foreground text-sm">{codes.length} code{codes.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New code"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-5 mb-6">
          <h2 className="font-semibold mb-4">Create discount code</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Code *</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm mt-1 uppercase"
                placeholder="SAVE20"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "PERCENTAGE" | "FIXED" }))}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed amount ($)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Value * {form.type === "PERCENTAGE" ? "(%)" : "($)"}</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                placeholder={form.type === "PERCENTAGE" ? "20" : "10"}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Min. order amount ($)</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                placeholder="Optional"
                value={form.minOrder}
                onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Usage limit</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                placeholder="Unlimited"
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Expiry date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={createCode} disabled={saving}>
            {saving ? "Creating…" : "Create code"}
          </Button>
        </div>
      )}

      {codes.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center text-muted-foreground">
          No discount codes yet. Create one to offer promotions to your customers.
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Discount</th>
                <th className="text-left px-4 py-3 font-medium">Min. order</th>
                <th className="text-left px-4 py-3 font-medium">Usage</th>
                <th className="text-left px-4 py-3 font-medium">Expires</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {codes.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.minOrder ? `$${c.minOrder.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.isActive ? "default" : "secondary"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => toggleActive(c.id, c.isActive)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {c.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => deleteCode(c.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
