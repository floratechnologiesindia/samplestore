'use client';

import Link from "next/link";

type Props = {
  size?: string;
  color?: string;
  sort?: string;
};

export default function CatalogFilters({ size, color, sort }: Props) {
  const handleAutoSubmit = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.target.form?.requestSubmit();
  };

  return (
    <div className="flex flex-col items-start gap-3 text-xs sm:flex-row sm:items-center sm:justify-end">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/category/streetwear"
          className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-100"
        >
          Streetwear
        </Link>
        <Link
          href="/category/essentials"
          className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-100"
        >
          Essentials
        </Link>
        <Link
          href="/category/accessories"
          className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-100"
        >
          Accessories
        </Link>
      </div>
      <form className="flex flex-wrap items-center gap-2" method="get">
        <select
          name="size"
          defaultValue={size ?? ""}
          onChange={handleAutoSubmit}
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
          defaultValue={color ?? ""}
          onChange={handleAutoSubmit}
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
          defaultValue={sort ?? ""}
          onChange={handleAutoSubmit}
          className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-700"
        >
          <option value="">Sort: Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        {(size || color || sort) && (
          <button
            type="submit"
            className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  );
}


