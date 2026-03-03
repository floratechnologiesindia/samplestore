'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccountTabs() {
  const pathname = usePathname();

  const isOrders = pathname.startsWith("/account/orders");
  const isProfile = pathname.startsWith("/account/profile");
  const isAddresses = pathname.startsWith("/account/addresses");

  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border";

  return (
    <nav className="mb-6 flex gap-2 text-xs">
      <Link
        href="/account/orders"
        className={
          baseClasses +
          (isOrders
            ? " border-zinc-900 bg-zinc-900 text-white"
            : " border-zinc-300 text-zinc-700 hover:bg-zinc-100")
        }
      >
        My orders
      </Link>
      <Link
        href="/account/profile"
        className={
          baseClasses +
          (isProfile
            ? " border-zinc-900 bg-zinc-900 text-white"
            : " border-zinc-300 text-zinc-700 hover:bg-zinc-100")
        }
      >
        Profile
      </Link>
      <Link
        href="/account/addresses"
        className={
          baseClasses +
          (isAddresses
            ? " border-zinc-900 bg-zinc-900 text-white"
            : " border-zinc-300 text-zinc-700 hover:bg-zinc-100")
        }
      >
        Addresses
      </Link>
    </nav>
  );
}

