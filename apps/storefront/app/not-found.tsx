import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
        TrendVibes Boutique
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-600">
        The link might be broken or the drop you&apos;re looking for has
        moved. Explore our latest pieces instead.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 font-medium text-white hover:bg-zinc-800"
        >
          Back to home
        </Link>
        <Link
          href="/category/streetwear"
          className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Shop streetwear
        </Link>
      </div>
    </div>
  );
}

