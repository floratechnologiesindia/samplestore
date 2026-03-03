import Link from "next/link";
import CatalogFilters from "../components/catalog-filters";

type ProductVariant = {
  id: number;
  size: string | null;
  color: string | null;
  stock: number;
  price: number | null;
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
    slug?: string;
  } | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents);
}

function getLowestPrice(product: Product): number {
  const variantPrices = product.variants
    .map((v) => v.price ?? product.basePrice)
    .filter((v) => typeof v === "number");
  if (variantPrices.length === 0) return product.basePrice;
  return Math.min(...variantPrices);
}

const FETCH_TIMEOUT_MS = 8000;

async function fetchProducts(): Promise<Product[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error("Failed to load products");
    }
    return res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  let products: Product[];
  let catalogError: string | null = null;
  try {
    products = await fetchProducts();
  } catch {
    products = [];
    catalogError =
      "Catalog couldn’t load. Make sure the API is running (npm run dev:api on port 4000) and refresh.";
  }

  const sizeParam =
    typeof searchParams?.size === "string" ? searchParams.size : undefined;
  const colorParam =
    typeof searchParams?.color === "string" ? searchParams.color : undefined;
  const sortParam =
    typeof searchParams?.sort === "string" ? searchParams.sort : undefined;

  let filtered = [...products];

  if (sizeParam) {
    const sizeLc = sizeParam.toLowerCase();
    filtered = filtered.filter((p) =>
      p.variants.some(
        (v) => v.size && v.size.toLowerCase() === sizeLc,
      ),
    );
  }

  if (colorParam) {
    const colorLc = colorParam.toLowerCase();
    filtered = filtered.filter((p) =>
      p.variants.some(
        (v) => v.color && v.color.toLowerCase() === colorLc,
      ),
    );
  }

  if (sortParam === "price_asc") {
    filtered.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
  } else if (sortParam === "price_desc") {
    filtered.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <section className="mb-10 grid gap-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-10 text-white sm:grid-cols-[2fr,1.3fr] sm:px-10 sm:py-14">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-300">
            TrendVibes Boutique
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Streetwear drops with{" "}
            <span className="underline decoration-zinc-400 decoration-2 underline-offset-4">
              everyday ease
            </span>
            .
          </h1>
          <p className="max-w-xl text-sm text-zinc-300 sm:text-base">
            Discover limited streetwear drops, elevated essentials, and accessories
            designed to move with you from day to night.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="#catalog"
              className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
            >
              Shop the drop
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center rounded-full border border-zinc-500/60 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Account
            </Link>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-700/60 bg-zinc-950/30 p-5 text-xs text-zinc-300">
          <div className="space-y-2">
            <p className="mb-1 font-medium text-zinc-100">
              Why TrendVibes?
            </p>
            <ul className="space-y-1.5">
              <li>• Curated edits, refreshed every season.</li>
              <li>• Easy exchanges within 30 days on eligible items.</li>
              <li>• Secure checkout experience for peace of mind.</li>
            </ul>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-700/60 pt-3 text-[11px]">
            <span>Ships from our boutique studio.</span>
            <span className="rounded-full bg-zinc-800/80 px-3 py-1 text-[10px]">
              TrendVibes Collection
            </span>
          </div>
        </div>
      </section>

      <section id="catalog" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              Featured pieces
            </h2>
            <p className="text-xs text-zinc-500">
              Curated looks from the latest TrendVibes drop.
            </p>
            <div className="mt-3 flex gap-3 text-[11px] text-zinc-500">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-900"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-900"
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-900"
              >
                TikTok
              </a>
            </div>
          </div>
          <CatalogFilters
            size={sizeParam}
            color={colorParam}
            sort={sortParam}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm text-zinc-600 space-y-2">
            <p>
              No products found yet. Once you add products via the API or seed
              script, they will appear here.
            </p>
            {catalogError && (
              <p className="text-amber-700 font-medium">{catalogError}</p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => {
              const primaryImage = product.media[0];
              const displayPrice =
                product.variants[0]?.price ?? product.basePrice;
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-zinc-100">
                    {primaryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primaryImage.url}
                        alt={primaryImage.altText ?? product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                        Image coming soon
                      </div>
                    )}
                    {product.category?.name && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-700">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                      TrendVibes · Drop
                    </p>
                    <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900">
                      {product.name}
                    </h3>
                    <p className="line-clamp-2 text-xs text-zinc-500">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900">
                        {formatPrice(displayPrice)}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {product.variants.length} variant
                        {product.variants.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
