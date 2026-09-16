"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateSchoolSettings } from "./actions/update-school-settings";

type School = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
};

type SchoolSettingsFormProps = {
  school: School;
};

export default function SchoolSettingsForm({
  school,
}: SchoolSettingsFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: school.name,
    code: school.code,
    address: school.address ?? "",
    phone: school.phone ?? "",
    email: school.email ?? "",
    website: school.website ?? "",
    logoUrl: school.logoUrl ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateSchoolSettings(form);

      setMessage("School settings updated successfully.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update school settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
          School profile
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
          School information
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Update the core information used throughout the school management
          portal.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              School name
            </span>

            <input
              value={form.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="BS International Academy"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              School code
            </span>

            <input
              value={form.code}
              onChange={(event) =>
                updateField("code", event.target.value)
              }
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="BSIA"
            />

            <span className="mt-1 block text-xs text-slate-400">
              Must be unique across schools.
            </span>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">
              Address
            </span>

            <textarea
              value={form.address}
              onChange={(event) =>
                updateField("address", event.target.value)
              }
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="School address"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Phone
            </span>

            <input
              value={form.phone}
              onChange={(event) =>
                updateField("phone", event.target.value)
              }
              type="tel"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="+234..."
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Email
            </span>

            <input
              value={form.email}
              onChange={(event) =>
                updateField("email", event.target.value)
              }
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="school@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Website
            </span>

            <input
              value={form.website}
              onChange={(event) =>
                updateField("website", event.target.value)
              }
              type="url"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="https://example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Logo URL
            </span>

            <input
              value={form.logoUrl}
              onChange={(event) =>
                updateField("logoUrl", event.target.value)
              }
              type="url"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="https://example.com/logo.png"
            />
          </label>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-400">
            Changes are saved to the school profile and used across the
            portal.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save school settings"}
          </button>
        </div>
      </form>
    </section>
  );
}
