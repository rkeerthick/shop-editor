"use client";

import { useState } from "react";
import { Star, Check, Trash2, Loader2, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  reviewerName: string;
  isApproved: boolean;
  createdAt: string;
  productTitle: string;
  productSlug: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
      ))}
    </div>
  );
}

export function ReviewsModerationClient({
  shopSlug,
  initialReviews,
}: {
  shopSlug: string;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  async function handleApprove(id: string, approve: boolean) {
    setLoadingId(id);
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: approve }),
    });
    setLoadingId(null);
    if (res.ok) {
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, isApproved: approve } : r));
    }
  }

  async function handleDelete(id: string) {
    setLoadingId(id);
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    setLoadingId(null);
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = reviews.filter((r) =>
    filter === "all" ? true : filter === "approved" ? r.isApproved : !r.isApproved
  );

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === f
                ? "bg-indigo-600 text-white border-transparent"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl py-16 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No reviews here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`bg-white border rounded-xl p-5 shadow-sm ${r.isApproved ? "border-slate-200" : "border-amber-200 bg-amber-50/30"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <StarRow rating={r.rating} />
                    <span className="font-semibold text-slate-800 text-sm">{r.reviewerName}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {r.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    On: <span className="text-slate-600 font-medium">{r.productTitle}</span>
                  </p>
                  {r.title && <p className="font-semibold text-slate-800 text-sm mb-1">{r.title}</p>}
                  {r.body && <p className="text-slate-600 text-sm leading-relaxed">{r.body}</p>}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!r.isApproved && (
                    <button
                      onClick={() => handleApprove(r.id, true)}
                      disabled={loadingId === r.id}
                      title="Approve"
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loadingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                  )}
                  {r.isApproved && (
                    <button
                      onClick={() => handleApprove(r.id, false)}
                      disabled={loadingId === r.id}
                      title="Unapprove"
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50 text-xs font-medium"
                    >
                      Unapprove
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={loadingId === r.id}
                    title="Delete"
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
