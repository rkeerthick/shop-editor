"use client";

import { useEffect, useState, use } from "react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

interface CustomerForm {
  name: string;
  email: string;
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface DiscountResult {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  discountAmount: number;
}

function PayForm({ shopSlug, clientSecret, orderId }: { shopSlug: string; clientSecret: string; orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError("");
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/store/${shopSlug}/checkout/success?order_id=${orderId}`,
      },
    });
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setPaying(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={paying || !stripe} className="w-full">
        {paying ? "Processing…" : "Pay Now"}
      </Button>
    </form>
  );
}

export default function CheckoutPage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = use(params);
  const [hydrated, setHydrated] = useState(false);
  const { items } = useCartStore();
  const [form, setForm] = useState<CustomerForm>({
    name: "", email: "", line1: "", city: "", state: "", postal_code: "", country: "US",
  });
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [discountInput, setDiscountInput] = useState("");
  const [discountResult, setDiscountResult] = useState<DiscountResult | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  useEffect(() => setHydrated(true), []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = discountResult?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);

  async function applyDiscount() {
    if (!discountInput.trim()) return;
    setApplyingDiscount(true);
    setDiscountError("");
    setDiscountResult(null);

    const res = await fetch(`/api/public/${shopSlug}/validate-discount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: discountInput.trim(), subtotal }),
    });
    const json = await res.json();
    setApplyingDiscount(false);

    if (!res.ok || json.error) {
      setDiscountError(json.error ?? "Invalid discount code");
    } else {
      setDiscountResult(json.data);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    const res = await fetch(`/api/public/${shopSlug}/payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: form.name,
          email: form.email,
          address: { line1: form.line1, city: form.city, state: form.state, postal_code: form.postal_code, country: form.country },
        },
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        discountCodeId: discountResult?.id ?? null,
        discountAmount,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok || json.error) {
      setFormError(json.error ?? "Something went wrong. Please try again.");
      return;
    }

    setClientSecret(json.data.clientSecret);
    setOrderId(json.data.orderId);
  }

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Link href={`/store/${shopSlug}`}><Button>Shop Now</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
      {/* Order summary */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={`${item.productId}:${item.variantId ?? ""}`} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.title} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Discount code input */}
        {!clientSecret && (
          <div className="border-t pt-4 mb-4">
            <p className="text-sm font-medium mb-2">Discount code</p>
            {discountResult ? (
              <div className="flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                <span className="text-green-700 font-medium">{discountResult.code} applied</span>
                <button onClick={() => { setDiscountResult(null); setDiscountInput(""); }} className="text-muted-foreground hover:text-foreground text-xs">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-md px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Enter code"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyDiscount())}
                />
                <Button variant="outline" size="sm" onClick={applyDiscount} disabled={applyingDiscount}>
                  {applyingDiscount ? "…" : "Apply"}
                </Button>
              </div>
            )}
            {discountError && <p className="text-xs text-red-600 mt-1">{discountError}</p>}
          </div>
        )}

        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({discountResult?.code})</span>
              <span>−${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-1 border-t">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment section */}
      <div>
        {!clientSecret ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Contact & Shipping</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              <input required placeholder="Address line 1" value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                <input required placeholder="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Postal code" value={form.postal_code} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                <input required placeholder="Country (e.g. US)" maxLength={2} value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Loading…" : "Continue to Payment"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">Payment</h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PayForm shopSlug={shopSlug} clientSecret={clientSecret} orderId={orderId} />
            </Elements>
          </>
        )}
      </div>
    </div>
  );
}
