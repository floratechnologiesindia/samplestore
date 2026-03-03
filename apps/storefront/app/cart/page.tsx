'use client';

import { useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type CartItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  productVariant: {
    id: number;
    size: string | null;
    color: string | null;
    product: {
      id: number;
      name: string;
      slug: string;
      media: { url: string; altText: string | null }[];
    };
  };
};

type Cart = {
  id: number;
  items: CartItem[];
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents);
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cartId = window.localStorage.getItem("trendvibes_cart_id");
    const existingEmail = window.localStorage.getItem("trendvibes_user_email");
    const existingName = window.localStorage.getItem("trendvibes_user_name");
    if (existingEmail) setEmail(existingEmail);
    if (existingName) setName(existingName);
    if (!cartId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/cart/${cartId}`);
        if (!res.ok) {
          throw new Error("Could not load cart");
        }
        const data = (await res.json()) as Cart;
        setCart(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const subtotal =
    cart?.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) ??
    0;
  const shipping = cart && cart.items.length > 0 ? 500 : 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!cart) return;
    if (!email) {
      setError("Please enter an email so we can send your order details.");
      return;
    }
    const customerId =
      typeof window !== "undefined"
        ? window.localStorage.getItem("trendvibes_user_id")
        : null;
    setCheckingOut(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          email,
          name: name || "TrendVibes Test Customer",
          customerId: customerId ? Number(customerId) : undefined,
          address: {
            line1: "123 Trend Lane",
            city: "Boutique City",
            country: "US",
            postalCode: "00000",
          },
        }),
      });
      if (!res.ok) {
        throw new Error("Checkout failed");
      }
      const data = await res.json();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("trendvibes_cart_id");
        window.location.href = `/order/${data.order.orderNumber}`;
      } else {
        setMessage(
          `Thank you for your order. Your order number is ${data.order.orderNumber}.`,
        );
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-sm text-zinc-600">Loading your cart…</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900">
          Your cart is empty
        </h1>
        <p className="mb-4 text-sm text-zinc-600">
          Browse the shop, add your favorite pieces, and return here to review
          your order before checking out.
        </p>
        <a
          href="/"
          className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Back to shop
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-zinc-900">
        Cart
      </h1>

      <div className="grid gap-8 md:grid-cols-[2fr,1.1fr]">
        <div className="space-y-4">
          {cart.items.map((item) => {
            const product = item.productVariant.product;
            const image = product.media[0];
            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-zinc-100">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt={image.altText ?? product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.productVariant.size &&
                        `Size ${item.productVariant.size} · `}
                      {item.productVariant.color &&
                        `Color ${item.productVariant.color}`}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs text-zinc-500">
                      Qty {item.quantity}
                    </span>
                    <span className="font-medium text-zinc-900">
                      {formatPrice(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Order summary
          </h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Shipping</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-zinc-900 font-semibold pt-2">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <label className="flex flex-col gap-1">
              <span className="text-zinc-700">Email (required)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-zinc-700">
                Name (optional, for order record)
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="TrendVibes Test"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </label>
            <p className="pt-1 text-[11px] text-zinc-500">
              We&apos;ll use these details for your confirmation and delivery
              updates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={checkingOut}
            className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-700"
          >
            {checkingOut ? "Placing your order…" : "Place order"}
          </button>

          {message && (
            <p className="text-xs text-emerald-600">
              {message}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

