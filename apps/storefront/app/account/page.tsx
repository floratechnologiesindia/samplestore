'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import AccountTabs from "../../components/account-tabs";

export default function AccountOverviewPage() {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [signOutMessage, setSignOutMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = window.localStorage.getItem("trendvibes_user_email");
    const storedName = window.localStorage.getItem("trendvibes_user_name");
    setEmail(storedEmail);
    setName(storedName);
  }, []);

  const handleSignOut = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("trendvibes_user_id");
    window.localStorage.removeItem("trendvibes_user_email");
    window.localStorage.removeItem("trendvibes_user_name");
    window.localStorage.removeItem("trendvibes_cart_id");
    setSignOutMessage("You have been signed out.");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900">
        My account
      </h1>
      <AccountTabs />
      {email ? (
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          <p>
            Signed in as{" "}
            <span className="font-medium text-zinc-900">
              {name || email}
            </span>
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="mb-6 space-y-3 text-sm text-zinc-600">
          <p>
            You&apos;re not signed in yet. Sign in or sign up to track your
            orders and manage your profile.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/login?redirect=/account/orders"
              className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
            >
              Sign in
            </Link>
            <Link
              href="/signup?redirect=/account/orders"
              className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}

      {signOutMessage && (
        <p className="mb-4 text-xs text-zinc-500">{signOutMessage}</p>
      )}

      <div className="space-y-4 text-sm text-zinc-600">
        <p>
          Use the tabs above to switch between{" "}
          <span className="font-medium text-zinc-900">My orders</span> and{" "}
          <span className="font-medium text-zinc-900">Profile</span>.
        </p>
        <p>
          You can also manage{" "}
          <Link
            href="/account/addresses"
            className="text-zinc-900 underline hover:text-zinc-800"
          >
            your saved addresses
          </Link>{" "}
          for faster checkout.
        </p>
      </div>
    </div>
  );
}


