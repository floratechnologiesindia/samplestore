'use client';

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existingEmail = window.localStorage.getItem("trendvibes_user_email");
    const existingName = window.localStorage.getItem("trendvibes_user_name");
    if (existingEmail) setEmail(existingEmail);
    if (existingName) setName(existingName);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter an email to sign up.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = (await res.json()) as {
        id: number;
        email: string;
        name?: string | null;
      };
      if (!res.ok) {
        throw new Error(
          (data as { message?: string }).message ||
            "Unable to sign up right now.",
        );
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("trendvibes_user_id", String(data.id));
        window.localStorage.setItem("trendvibes_user_email", data.email);
        window.localStorage.setItem(
          "trendvibes_user_name",
          data.name || name || email.split("@")[0] || "TrendVibes Customer",
        );
      }
      const redirect = searchParams.get("redirect") || "/account";
      router.push(redirect);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10 sm:px-6">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold tracking-tight text-zinc-900">
          Create your TrendVibes account
        </h1>
        <p className="mb-4 text-sm text-zinc-600">
          Sign up with your email and password so we can keep your cart and
          orders in one place.
        </p>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-800">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-800">Name (optional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="TrendVibes Customer"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-800">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              required
            />
            <span className="text-[11px] text-zinc-500">
              Minimum 6 characters.
            </span>
          </label>
          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sign up
          </button>
        </form>
        <p className="mt-3 text-[11px] text-zinc-500">
          We respect your privacy and never share your details.
        </p>
      </div>
    </div>
  );
}

