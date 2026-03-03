'use client';

import { useEffect, useState } from "react";

type SessionInfo = {
  id: string | null;
  email: string | null;
  name: string | null;
};

export default function AccountMenu() {
  const [session, setSession] = useState<SessionInfo>({
    id: null,
    email: null,
    name: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.localStorage.getItem("trendvibes_user_id");
    const email = window.localStorage.getItem("trendvibes_user_email");
    const name = window.localStorage.getItem("trendvibes_user_name");
    setSession({ id, email, name });
  }, []);

  if (!session.email) {
    return (
      <a href="/account" className="text-sm hover:text-zinc-900">
        Account
      </a>
    );
  }

  const displayName =
    session.name || session.email.split("@")[0] || "TrendVibes Customer";

  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className="hidden text-xs text-zinc-600 sm:inline"
        title={displayName}
      >
        Hi, <span className="font-semibold text-zinc-900">{displayName}</span>
      </span>
      <a
        href="/account"
        className="font-medium text-zinc-700 hover:text-zinc-900"
      >
        Account
      </a>
    </div>
  );
}

