import Link from "next/link";
import AddToCartButton from "../../../components/add-to-cart-button";

type ProductVariant = {
  id: number;
  size: string | null;
  color: string | null;
  stock: number;
  price: number | null;
  sku: string;
};

type MediaAsset = {
  id: number;
  url: string;
  altText: string | null;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  media: MediaAsset[];
  variants: ProductVariant[];
  category?: {
    name: string;
  } | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(cents / 100);
}

async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
    cache: "no-store",
  });
  if (res.status === 404) {
    throw new Error("Not found");
  }
  if (!res.ok) {
    throw new Error("Failed to load product");
  }
  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  const primaryImage = product.media[0];
  const variants = product.variants;
  const defaultVariant = variants[0];
  const displayPrice =
    defaultVariant?.price ?? product.basePrice ?? product.basePrice;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-800"
      >
        ← Back to shop
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
          <div className="relative h-80 w-full bg-zinc-100 sm:h-96">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.url}
                alt={primaryImage.altText ?? product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                Image coming soon
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
              TrendVibes · Boutique
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {product.name}
            </h1>
            {product.category?.name && (
              <p className="text-xs text-zinc-500">{product.category.name}</p>
            )}
          </div>

          <p className="text-sm text-zinc-600">{product.description}</p>

          <div className="space-y-2 rounded-2xl bg-zinc-50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Price
              </span>
              <span className="text-lg font-semibold text-zinc-900">
                {formatPrice(displayPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>
                {variants.length} variant
                {variants.length === 1 ? "" : "s"}
              </span>
              <span>Stock:{" "}
                {variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)} pcs
              </span>
            </div>
          </div>

          {defaultVariant && (
            <AddToCartButton
              variantId={defaultVariant.id}
              label="Add to cart and test flow"
            />
          )}

          <p className="text-[11px] text-zinc-500">
            Complete your look with other pieces from the TrendVibes collection
            and track your order from confirmation to delivery.
          </p>
        </div>
      </div>
    </div>
  );
}

