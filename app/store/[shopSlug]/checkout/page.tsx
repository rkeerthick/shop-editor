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

function PayForm({
  shopSlug,
  clientSecret,
  orderId,
}: {
  shopSlug: string;
  clientSecret: string;
  orderId: string;
}) {
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

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = use(params);
  const [hydrated, setHydrated] = useState(false);
  const { items } = useCartStore();
  const [form, setForm] = useState<CustomerForm>({
    name: "",
    email: "",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => setHydrated(true), []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

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
          address: {
            line1: form.line1,
            city: form.city,
            state: form.state,
            postal_code: form.postal_code,
            country: form.country,
          },
        },
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
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
        <Link href={`/store/${shopSlug}`}>
          <Button>Shop Now</Button>
        </Link>
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
              <span className="text-muted-foreground">
                {item.title} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment section */}
      <div>
        {!clientSecret ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Contact & Shipping</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <input
                required
                placeholder="Address line 1"
                value={form.line1}
                onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  required
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Postal code"
                  value={form.postal_code}
                  onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  required
                  placeholder="Country (e.g. US)"
                  maxLength={2}
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
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
