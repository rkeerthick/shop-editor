"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TrackForm({
  shopSlug,
  initialOrderId,
  initialEmail,
  error,
}: {
  shopSlug: string;
  initialOrderId: string;
  initialEmail: string;
  error: string;
}) {
  const router = useRouter();
  const [orderId, setOrderId] = useState(initialOrderId);
  const [email, setEmail] = useState(initialEmail);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    router.push(`/store/${shopSlug}/track?orderId=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Order ID</label>
        <input
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent font-mono"
          placeholder="e.g. cm4abc123..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ "--tw-ring-color": "var(--brand)" } as React.CSSProperties}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
        <input
          required
          type="email"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <button type="submit" className="store-btn w-full py-2.5 text-sm font-semibold text-white transition-all">
        Track Order
      </button>
    </form>
  );
}
