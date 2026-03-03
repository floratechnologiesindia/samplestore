import Link from "next/link";

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

type Category = {
  id: number;
  name: string;
  slug: string;
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
  }).format(cents / 100);
}

async function fetchCatalog(): Promise<{
  products: Product[];
  categories: Category[];
}> {
  const { fetchWithTimeout } = await import("../../../lib/api");
  const [productsRes, categoriesRes] = await Promise.all([
    fetchWithTimeout(`${API_BASE_URL}/products`, { cache: "no-store" }),
    fetchWithTimeout(`${API_BASE_URL}/categories`, { cache: "no-store" }),
  ]);
  if (!productsRes.ok || !categoriesRes.ok) {
    throw new Error("Failed to load category catalog.");
  }
  return {
    products: (await productsRes.json()) as Product[],
    categories: (await categoriesRes.json()) as Category[],
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = await params;
  let products: Product[] = [];
  let categories: Category[] = [];
  try {
    const catalog = await fetchCatalog();
    products = catalog.products;
    categories = catalog.categories;
  } catch {
    // Timeout or API down: show empty state
  }
  const category = categories.find((c) => c.slug === slug);

  const sizeParam =
    typeof searchParams?.size === "string" ? searchParams.size : undefined;
  const colorParam =
    typeof searchParams?.color === "string" ? searchParams.color : undefined;
  const sortParam =
    typeof searchParams?.sort === "string" ? searchParams.sort : undefined;

  let filtered = products.filter((p) => {
    const catSlug = (p.category as { slug?: string } | undefined)?.slug;
    return catSlug ? catSlug === slug : false;
  });

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
    filtered.sort((a, b) => {
      const priceA = a.variants[0]?.price ?? a.basePrice;
      const priceB = b.variants[0]?.price ?? b.basePrice;
      return priceA - priceB;
    });
  } else if (sortParam === "price_desc") {
    filtered.sort((a, b) => {
      const priceA = a.variants[0]?.price ?? a.basePrice;
      const priceB = b.variants[0]?.price ?? b.basePrice;
      return priceB - priceA;
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Category
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            {category?.name ?? "Shop"}{" "}
            {category ? " · TrendVibes Boutique" : ""}
          </h1>
        </div>
        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center">
          <form className="flex gap-2" method="get">
            <select
              name="size"
              defaultValue={sizeParam ?? ""}
              className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-700"
            >
              <option value="">All sizes</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
            <select
              name="color"
              defaultValue={colorParam ?? ""}
              className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-700"
            >
              <option value="">All colors</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Stone">Stone</option>
              <option value="Olive">Olive</option>
            </select>
            <select
              name="sort"
              defaultValue={sortParam ?? ""}
              className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-700"
            >
              <option value="">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <button
              type="submit"
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Apply
            </button>
          </form>
          <Link
            href="/"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
          >
            ← All products
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm text-zinc-600">
          We don&apos;t have pieces in this category just yet. Check back soon
          or explore our full collection.
        </p>
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
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                    TrendVibes · {category?.name ?? "Collection"}
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
    </div>
  );
}

