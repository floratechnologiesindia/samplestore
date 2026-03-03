'use client';

import { useEffect, useState } from "react";
import AccountTabs from "../../../components/account-tabs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function AccountProfilePage() {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.localStorage.getItem("trendvibes_user_id");
    const storedEmail = window.localStorage.getItem("trendvibes_user_email");
    const storedName = window.localStorage.getItem("trendvibes_user_name") ?? "";
    if (!id || !storedEmail) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        "/account/profile",
      )}`;
      return;
    }
    setCustomerId(id);
    setEmail(storedEmail);
    setName(storedName);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
        }),
      });
      if (!res.ok) {
        throw new Error("Unable to save your profile right now.");
      }
      if (typeof window !== "undefined") {
        if (name.trim()) {
          window.localStorage.setItem("trendvibes_user_name", name.trim());
        } else {
          window.localStorage.removeItem("trendvibes_user_name");
        }
      }
      setMessage("Profile updated.");
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    if (newPassword.length < 6) {
      setPasswordMessage("New password should be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }
    try {
      setPasswordSaving(true);
      setPasswordMessage(null);
      const res = await fetch(`${API_BASE_URL}/customers/${customerId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword || undefined,
          newPassword,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(
          data?.message || "Unable to update your password right now.",
        );
      }
      setPasswordMessage("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage((err as Error).message);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!customerId || !email) {
    return null;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900">
        My account
      </h1>
      <AccountTabs />
      <p className="mb-4 text-sm text-zinc-600">
        Keep your account details up to date so order emails reach the right place.
      </p>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-2xl bg-white p-5">
        <div className="space-y-1 text-sm">
          <label className="block text-xs font-medium text-zinc-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
          />
          <p className="text-[11px] text-zinc-500">
            Email is used for login and order updates in this demo store.
          </p>
        </div>

        <div className="space-y-1 text-sm">
          <label
            htmlFor="name"
            className="block text-xs font-medium text-zinc-700"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="TrendVibes customer"
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        {message && (
          <p className="text-xs text-zinc-600" role="status">
            {message}
          </p>
        )}
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-4 rounded-2xl bg-white p-5"
      >
        <div className="space-y-1 text-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Password
          </h2>
          <p className="text-xs text-zinc-500">
            Set or change your password for signing in to TrendVibes.
          </p>
        </div>

        <div className="space-y-1 text-sm">
          <label
            htmlFor="currentPassword"
            className="block text-xs font-medium text-zinc-700"
          >
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
            autoComplete="current-password"
          />
          <p className="text-[11px] text-zinc-500">
            Leave this blank if you haven&apos;t set a password before.
          </p>
        </div>

        <div className="space-y-1 text-sm">
          <label
            htmlFor="newPassword"
            className="block text-xs font-medium text-zinc-700"
          >
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-1 text-sm">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium text-zinc-700"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={passwordSaving}
          className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {passwordSaving ? "Saving…" : "Update password"}
        </button>

        {passwordMessage && (
          <p className="text-xs text-zinc-600" role="status">
            {passwordMessage}
          </p>
        )}
      </form>
    </div>
  );
}

