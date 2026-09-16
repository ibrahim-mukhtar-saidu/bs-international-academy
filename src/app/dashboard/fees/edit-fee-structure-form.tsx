"use client";

import { useState } from "react";
import { updateFeeStructure } from "./actions/update-fee-structure";

const feeTypes = [
  "TUITION",
  "REGISTRATION",
  "EXAMINATION",
  "DEVELOPMENT",
  "TRANSPORT",
  "UNIFORM",
  "BOOKS",
  "OTHER",
] as const;

type FeeStructure = {
  id: string;
  name: string;
  feeType: string;
  amount: number;
  description: string | null;
  isActive: boolean;
};

export default function EditFeeStructureForm({
  fee,
}: {
  fee: FeeStructure;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setSaving(true);

    try {
      await updateFeeStructure(fee.id, formData);
      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update fee structure.",
      );
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
                    Finance
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Edit Fee Structure
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <form action={handleSubmit} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor={`fee-name-${fee.id}`}
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Fee Name
                </label>

                <input
                  id={`fee-name-${fee.id}`}
                  name="name"
                  type="text"
                  required
                  defaultValue={fee.name}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor={`fee-type-${fee.id}`}
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Fee Type
                </label>

                <select
                  id={`fee-type-${fee.id}`}
                  name="feeType"
                  defaultValue={fee.feeType}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  {feeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`fee-amount-${fee.id}`}
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Amount
                </label>

                <div className="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10">
                  <span className="flex items-center bg-slate-50 px-4 text-sm font-semibold text-slate-600">
                    ₦
                  </span>

                  <input
                    id={`fee-amount-${fee.id}`}
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    defaultValue={Number(fee.amount)}
                    className="w-full px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`fee-description-${fee.id}`}
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id={`fee-description-${fee.id}`}
                  name="description"
                  rows={3}
                  defaultValue={fee.description ?? ""}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor={`fee-status-${fee.id}`}
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Status
                </label>

                <select
                  id={`fee-status-${fee.id}`}
                  name="isActive"
                  defaultValue={fee.isActive ? "true" : "false"}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  <option value="true">ACTIVE</option>
                  <option value="false">INACTIVE</option>
                </select>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
