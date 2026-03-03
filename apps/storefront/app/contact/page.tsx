import Link from "next/link";

export const metadata = {
  title: "Contact Us | TrendVibes Boutique",
  description:
    "Get in touch with TrendVibes Boutique — questions about orders, fits, or the collection.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
        Contact us
      </h1>
      <p className="mb-8 text-sm uppercase tracking-[0.2em] text-zinc-500">
        We’d love to hear from you
      </p>

      <div className="space-y-8 text-sm text-zinc-600">
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900">
            Customer support
          </h2>
          <p className="mb-3">
            Questions about fits, fabrics, orders, or returns? Reach out and
            we’ll get back to you as soon as we can.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Email:</span>{" "}
            <a
              href="mailto:support@trendvibes.example"
              className="text-zinc-800 underline hover:text-zinc-900"
            >
              support@trendvibes.example
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900">
            Response times
          </h2>
          <p>
            We aim to reply within 1–2 business days. For order status, you can
            also check{" "}
            <Link href="/account/orders" className="text-zinc-800 underline hover:text-zinc-900">
              your orders
            </Link>{" "}
            in your account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900">
            Send us a message
          </h2>
          <form className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-zinc-800">Name</span>
                <input
                  type="text"
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="Your name"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-zinc-800">Email</span>
                <input
                  type="email"
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-zinc-800">Message</span>
              <textarea
                rows={4}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                placeholder="Tell us what you’d like help with…"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2 text-xs font-medium text-white hover:bg-zinc-800"
            >
              Submit
            </button>
            <p className="text-[11px] text-zinc-500">
              This form is for demo purposes only and doesn&apos;t send real
              messages.
            </p>
          </form>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900">
            Visit or message us
          </h2>
          <div className="grid gap-4 sm:grid-cols-[2fr,1.4fr]">
            <div className="overflow-hidden rounded-2xl border border-zinc-200">
              <iframe
                title="TrendVibes Boutique location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9236000000003!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjciTiA3N8KwMzUnNDEuNiJF!5e0!3m2!1sen!2sin!4v1700000000000"
                className="h-56 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="space-y-2 text-xs text-zinc-600">
              <p className="font-medium text-zinc-900">Studio address</p>
              <p>
                TrendVibes Boutique Studio
                <br />
                123 Streetwear Lane
                <br />
                Bengaluru, Karnataka 560001
              </p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center rounded-full border border-green-600 px-4 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900">
            Other links
          </h2>
          <ul className="space-y-1">
            <li>
              <Link href="/info/shipping-and-returns" className="text-zinc-800 underline hover:text-zinc-900">
                Shipping & returns
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-zinc-800 underline hover:text-zinc-900">
                About us
              </Link>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 text-xs text-zinc-500">
          <p>
            This is a demo store. The contact details above are placeholders;
            no real support team will respond.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-600">
        <div className="flex gap-3">
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
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-zinc-800"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
