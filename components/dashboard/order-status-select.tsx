"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export function OrderStatusSelect({ orderId, current }: { orderId: string; current: OrderStatus }) {
  const [status, setStatus] = useState<OrderStatus>(current);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value as OrderStatus); setSaved(false); }}
        className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <Button size="sm" onClick={handleSave} disabled={saving || status === current}>
        {saving ? "Saving…" : saved ? "Saved!" : "Update"}
      </Button>
    </div>
  );
}
