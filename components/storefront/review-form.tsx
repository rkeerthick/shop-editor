"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";

interface ReviewFormProps {
  shopSlug: string;
  productId: string;
}

export function ReviewForm({ shopSlug, productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating"); return; }
    if (!name.trim()) { setError("Please enter your name"); return; }

    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/public/${shopSlug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, title: title.trim(), body: body.trim(), reviewerName: name.trim() }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(json.error ?? "Something went wrong"); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <p className="text-green-700 font-semibold mb-1">Thank you for your review!</p>
        <p className="text-green-600 text-sm">It will appear once approved by the store owner.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-slate-800">Write a review</h3>

      {/* Star picker */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hover || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Your name *</label>
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Title <span className="text-slate-400 font-normal">(optional)</span></label>
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Great product!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Review <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Share your experience with this product…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="store-btn flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
