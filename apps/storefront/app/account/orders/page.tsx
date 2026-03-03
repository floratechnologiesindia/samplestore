'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import AccountTabs from "../../../components/account-tabs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type OrderItem = {
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
    };
  };
};

type Order = {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  createdAt: string;
  items: OrderItem[];
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(cents / 100);
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (typeof window === "undefined") return;
      const id = window.localStorage.getItem("trendvibes_user_id");
      const email = window.localStorage.getItem("trendvibes_user_email");
      const name = window.localStorage.getItem("trendvibes_user_name");
      if (name) setCustomerName(name);
      if (!id || !email) {
        window.location.href = `/login?redirect=${encodeURIComponent(
          "/account/orders",
        )}`;
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/customers/${id}/orders`);
        if (!res.ok) {
          throw new Error("Unable to load your orders.");
        }
        const data = (await res.json()) as Order[];
        setOrders(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900">
          My account
        </h1>
        <AccountTabs />
        <p className="text-sm text-zinc-600">Loading your order history…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900">
          My account
        </h1>
        <AccountTabs />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900">
          My account
        </h1>
        <AccountTabs />
        <p className="mb-4 text-sm text-zinc-600">
          You haven&apos;t placed any orders yet. Once you do, they&apos;ll
          appear here.
        </p>
        <a
          href="/"
          className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Browse products
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900">
        My account
      </h1>
      <AccountTabs />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
          Your orders
        </h2>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Order
                </p>
                <Link
                  href={`/order/${order.orderNumber}`}
                  className="text-sm font-medium text-zinc-900 hover:underline"
                >
                  {order.orderNumber}
                </Link>
                <p className="text-xs text-zinc-500">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Total
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {formatPrice(order.grandTotal)}
                </p>
                <p className="text-xs text-zinc-500">
                  {order.status} · {order.paymentStatus}
                </p>
              </div>
            </div>
            <div className="mt-3 border-t border-zinc-200 pt-3 text-xs text-zinc-600">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="truncate">
                    {item.productVariant.product.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.quantity * item.unitPrice)}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="mt-1 text-[11px] text-zinc-500">
                  + {order.items.length - 3} more item(s)
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

