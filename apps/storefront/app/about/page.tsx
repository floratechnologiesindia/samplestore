import Link from "next/link";

export const metadata = {
  title: "About Us | TrendVibes Boutique",
  description:
    "Learn about TrendVibes Boutique — curated streetwear and everyday essentials from our boutique studio.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
        About TrendVibes Boutique
      </h1>
      <p className="mb-8 text-sm uppercase tracking-[0.2em] text-zinc-500">
        Our story
      </p>

      <div className="space-y-8 text-sm text-zinc-600">
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900">
            Who we are
          </h2>
          <p>
            TrendVibes Boutique is a concept store for laid-back streetwear and
            elevated everyday essentials. Every piece is curated to mix easily
            into your rotation and feel good from first wear. We focus on
            quality, comfort, and looks that work from day to night.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900">
            What we offer
          </h2>
          <p>
            From oversized tees and cropped puffers to wide-leg pants and
            minimal accessories, our drops are designed to move with you. We
            refresh the edit every season so you can discover new favorites
            without the clutter.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900">
            Our values
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>Curated edits, no filler</li>
            <li>Easy exchanges within 30 days on eligible items</li>
            <li>Transparent materials and care so you know what you’re buying</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 text-xs text-zinc-500">
          <p>
            This site is a demo. Orders and payments are simulated so you can
            explore the full shopping journey end-to-end. No real orders are
            fulfilled.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Shop the drop
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}
