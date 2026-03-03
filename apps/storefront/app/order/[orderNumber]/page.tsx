import Link from "next/link";

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
  subtotal: number;
  shippingTotal: number;
  createdAt: string;
  items: OrderItem[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(cents / 100);
}

async function fetchOrder(orderNumber: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderNumber}`, {
    cache: "no-store",
  });
  if (res.status === 404) {
    throw new Error("Not found");
  }
  if (!res.ok) {
    throw new Error("Failed to load order");
  }
  return res.json();
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await fetchOrder(orderNumber);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Order confirmation
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Thank you for your order
          </h1>
          <p className="text-xs text-zinc-500">
            Order number{" "}
            <span className="font-mono font-medium">{order.orderNumber}</span>
          </p>
        </div>
        <Link
          href="/account/orders"
          className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
        >
          View all orders
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1.2fr]">
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 text-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Items</h2>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 text-xs text-zinc-600"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900">
                  {item.productVariant.product.name}
                </p>
                <p>
                  Qty {item.quantity}
                  {item.productVariant.size && ` · Size ${item.productVariant.size}`}
                  {item.productVariant.color && ` · ${item.productVariant.color}`}
                </p>
              </div>
              <p className="whitespace-nowrap font-medium text-zinc-900">
                {formatPrice(item.quantity * item.unitPrice)}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 text-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Order summary
          </h2>
          <div className="space-y-1 text-xs text-zinc-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(order.shippingTotal)}</span>
            </div>
            <div className="flex justify-between pt-2 text-zinc-900">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">
                {formatPrice(order.grandTotal)}
              </span>
            </div>
          </div>
          <div className="space-y-1 text-xs text-zinc-500">
            <p>
              Placed on {new Date(order.createdAt).toLocaleString()} · Status:{" "}
              <span className="font-medium text-zinc-800">
                {order.status} · {order.paymentStatus}
              </span>
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2 text-xs font-medium text-white hover:bg-zinc-800"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

