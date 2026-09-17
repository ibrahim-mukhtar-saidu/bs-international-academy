"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { enrollAdmission } from "./actions/enroll-admission";

type EnrollFormProps = {
  applicationId: string;
  defaultEmail: string;
};

export default function EnrollForm({
  applicationId,
  defaultEmail,
}: EnrollFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await enrollAdmission({
        applicationId,
        email,
        password,
        admissionNo,
      });

      setPassword("");
      setAdmissionNo("");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to enroll student.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
        Enroll approved applicant
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="text-xs font-semibold text-slate-700">
          Student email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="text-xs font-semibold text-slate-700">
          Temporary password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
            placeholder="Minimum 8 characters"
            className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="text-xs font-semibold text-slate-700">
          Admission number
          <input
            value={admissionNo}
            onChange={(event) => setAdmissionNo(event.target.value)}
            required
            placeholder="e.g. BSIA/2027/002"
            className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal uppercase outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Enrolling..." : "Enroll Student"}
      </button>
    </form>
  );
}
