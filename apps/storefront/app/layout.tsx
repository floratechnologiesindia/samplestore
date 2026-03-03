import type { Metadata } from "next";
import "./globals.css";
import MainNav from "../components/main-nav";

export const metadata: Metadata = {
  title: "TrendVibes Boutique",
  description:
    "TrendVibes Boutique — curated streetwear and essentials for everyday confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-zinc-50 text-zinc-900 font-sans">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
            <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                  TV
                </span>
                <div>
                  <div className="text-sm font-semibold tracking-[0.2em] uppercase text-zinc-800">
                    TrendVibes
                  </div>
                  <div className="text-xs text-zinc-500">Boutique</div>
                </div>
              </div>
              <MainNav />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-zinc-500">
                  © {new Date().getFullYear()} TrendVibes Boutique
                </span>
                <nav className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <a href="/about" className="hover:text-zinc-900">
                    About
                  </a>
                  <a href="/contact" className="hover:text-zinc-900">
                    Contact
                  </a>
                  <a href="/info/shipping-and-returns" className="hover:text-zinc-900">
                    Shipping & returns
                  </a>
                </nav>
                <span className="text-xs text-zinc-500">
                  Demo store · No real orders fulfilled
                </span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

