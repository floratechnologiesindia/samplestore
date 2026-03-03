'use client';

import { useEffect, useState } from "react";
import AccountTabs from "../../../components/account-tabs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type Address = {
  id: number;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  country: string;
  postalCode: string;
  phone: string | null;
};

export default function AccountAddressesPage() {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    region: "",
    country: "",
    postalCode: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.localStorage.getItem("trendvibes_user_id");
    const email = window.localStorage.getItem("trendvibes_user_email");
    if (!id || !email) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        "/account/addresses",
      )}`;
      return;
    }
    setCustomerId(id);

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/customers/${id}/addresses`);
        if (!res.ok) {
          throw new Error("Unable to load your saved addresses.");
        }
        const data = (await res.json()) as Address[];
        setAddresses(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/customers/${customerId}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line1: form.line1.trim(),
          line2: form.line2.trim() || undefined,
          city: form.city.trim(),
          region: form.region.trim() || undefined,
          country: form.country.trim(),
          postalCode: form.postalCode.trim(),
          phone: form.phone.trim() || undefined,
        }),
      });
      if (!res.ok) {
        throw new Error("Unable to save address right now.");
      }
      const created = (await res.json()) as Address;
      setAddresses((prev) => [created, ...prev]);
      setForm({
        line1: "",
        line2: "",
        city: "",
        region: "",
        country: "",
        postalCode: "",
        phone: "",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900">
          My account
        </h1>
        <AccountTabs />
        <p className="text-sm text-zinc-600">Loading your saved addresses…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900">
        My account
      </h1>
      <AccountTabs />
      <p className="mb-6 text-sm text-zinc-600">
        Manage the places you ship to most often. In a real store, we&apos;d
        use these during checkout so you don&apos;t have to retype them.
      </p>

      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-3 rounded-2xl bg-white p-5 text-sm"
      >
        <h2 className="text-sm font-semibold text-zinc-900">
          Add a new address
        </h2>
        <div className="space-y-1">
          <label
            htmlFor="line1"
            className="block text-xs font-medium text-zinc-700"
          >
            Address line 1
          </label>
          <input
            id="line1"
            name="line1"
            value={form.line1}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="line2"
            className="block text-xs font-medium text-zinc-700"
          >
            Address line 2 (optional)
          </label>
          <input
            id="line2"
            name="line2"
            value={form.line2}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="city"
              className="block text-xs font-medium text-zinc-700"
            >
              City
            </label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="region"
              className="block text-xs font-medium text-zinc-700"
            >
              State / Region
            </label>
            <input
              id="region"
              name="region"
              value={form.region}
              onChange={handleChange}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="country"
              className="block text-xs font-medium text-zinc-700"
            >
              Country
            </label>
            <input
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="postalCode"
              className="block text-xs font-medium text-zinc-700"
            >
              Postal code
            </label>
            <input
              id="postalCode"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="phone"
            className="block text-xs font-medium text-zinc-700"
          >
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving…" : "Save address"}
        </button>
      </form>

      <div className="space-y-3">
        {addresses.length === 0 ? (
          <p className="text-sm text-zinc-600">
            You haven&apos;t saved any addresses yet.
          </p>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-800"
            >
              <p className="font-medium text-zinc-900">{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {address.city}
                {address.region ? `, ${address.region}` : ""}{" "}
                {address.postalCode}
              </p>
              <p>{address.country}</p>
              {address.phone && (
                <p className="text-xs text-zinc-500">Phone {address.phone}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

