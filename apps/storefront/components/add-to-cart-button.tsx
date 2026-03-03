'use client';

import { useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type Props = {
  variantId: number;
  label?: string;
};

export default function AddToCartButton({ variantId, label }: Props) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const userEmail =
        typeof window !== "undefined"
          ? window.localStorage.getItem("trendvibes_user_email")
          : null;

      if (!userEmail) {
        if (typeof window !== "undefined") {
          const redirect = encodeURIComponent(window.location.href);
          window.location.href = `/login?redirect=${redirect}`;
        }
        return;
      }

      let cartId = typeof window !== "undefined"
        ? window.localStorage.getItem("trendvibes_cart_id")
        : null;

      if (!cartId) {
        const res = await fetch(`${API_BASE_URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          throw new Error("Failed to create cart");
        }
        const cart = (await res.json()) as { id: number };
        cartId = String(cart.id);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("trendvibes_cart_id", cartId);
        }
      }

      const res = await fetch(`${API_BASE_URL}/cart/${cartId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productVariantId: variantId,
          quantity: 1,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to add to cart");
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-700"
      >
        {loading
          ? "Adding..."
          : added
            ? "Added to cart"
            : label ?? "Add to cart"}
      </button>
      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
      {!error && (
        <p className="text-[11px] text-zinc-500">
          We&apos;ll create a local cart and keep its ID in your browser so you
          can view it on the Cart page.
        </p>
      )}
    </div>
  );
}

