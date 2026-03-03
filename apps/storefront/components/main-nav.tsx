'use client';

import { useState } from "react";
import AccountMenu from "./account-menu";

export default function MainNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 text-xs sm:gap-4 sm:text-sm font-medium text-zinc-700">
      {/* Desktop nav */}
      <nav className="hidden items-center gap-4 sm:flex">
        <a href="/" className="hover:text-zinc-900">
          Shop
        </a>
        <a href="/about" className="hover:text-zinc-900">
          About
        </a>
        <a href="/cart" className="hover:text-zinc-900">
          Cart
        </a>
        <a href="/contact" className="hover:text-zinc-900">
          Contact
        </a>
        <AccountMenu />
      </nav>

      {/* Mobile: account + hamburger */}
      <div className="flex items-center gap-2 sm:hidden">
        <AccountMenu />
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-[10px] text-zinc-700 hover:border-zinc-400"
        >
          <span className="sr-only">Toggle menu</span>
          <span className="flex flex-col gap-[3px]">
            <span className="block h-[1px] w-4 bg-zinc-800" />
            <span className="block h-[1px] w-4 bg-zinc-800" />
            <span className="block h-[1px] w-4 bg-zinc-800" />
          </span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-[56px] z-40 border-b border-zinc-200 bg-white/95 px-4 pb-3 pt-2 shadow-sm sm:hidden">
          <nav className="flex flex-col gap-2 text-xs text-zinc-700">
            <a href="/" className="py-1 hover:text-zinc-900">
              Shop
            </a>
            <a href="/about" className="py-1 hover:text-zinc-900">
              About
            </a>
            <a href="/cart" className="py-1 hover:text-zinc-900">
              Cart
            </a>
            <a href="/contact" className="py-1 hover:text-zinc-900">
              Contact
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}

