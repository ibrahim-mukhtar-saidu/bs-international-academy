"use client";

import { useState } from "react";
import { recordPayment } from "./actions/record-payment";

type StudentFee = {
  id: string;
  studentName: string;
  admissionNo: string;
  feeName: string;
  sessionName: string;
  termName: string;
  amountDue: number;
  amountPaid: number;
  outstanding: number;
  status: string;
};

export default function RecordPaymentForm({
  studentFees,
}: {
  studentFees: StudentFee[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState(
    studentFees[0]?.id ?? "",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedFee = studentFees.find(
    (fee) => fee.id === selectedFeeId,
  );

  async function handleSubmit(formData: FormData) {
    setError("");
    setSaving(true);

    try {
      const result = await recordPayment(formData);

      window.alert(
        `Payment recorded successfully.\nReceipt: ${result.receiptNo}`,
      );

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to record payment.",
      );
      setSaving(false);
    }
  }

  if (studentFees.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <p className="font-semibold text-slate-900">
          No outstanding student fees
        </p>

        <p className="mt-1 text-sm text-slate-500">
          There are currently no pending or partially paid fees available
          for payment.
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
      >
        Record Payment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
                    Finance Management
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Record Payment
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Record a payment against an outstanding student fee.
                  </p>
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
                  htmlFor="student-fee-id"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Student Fee
                </label>

                <select
                  id="student-fee-id"
                  name="studentFeeId"
                  value={selectedFeeId}
                  onChange={(event) =>
                    setSelectedFeeId(event.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  {studentFees.map((fee) => (
                    <option key={fee.id} value={fee.id}>
                      {fee.studentName} — {fee.feeName} — ₦
                      {fee.outstanding.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {selectedFee && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Student
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {selectedFee.studentName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedFee.admissionNo}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Amount Due
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      ₦{selectedFee.amountDue.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                    <p className="text-xs font-medium text-cyan-700">
                      Outstanding
                    </p>

                    <p className="mt-1 text-lg font-bold text-cyan-900">
                      ₦{selectedFee.outstanding.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="payment-amount"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Payment Amount
                </label>

                <div className="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10">
                  <span className="flex items-center bg-slate-50 px-4 text-sm font-semibold text-slate-600">
                    ₦
                  </span>

                  <input
                    id="payment-amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    max={selectedFee?.outstanding ?? undefined}
                    step="0.01"
                    required
                    defaultValue={selectedFee?.outstanding.toFixed(2) ?? ""}
                    key={selectedFeeId}
                    className="w-full px-4 py-3 text-sm outline-none"
                  />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Maximum payment: ₦
                  {selectedFee?.outstanding.toLocaleString() ?? "0"}
                </p>
              </div>

              <div>
                <label
                  htmlFor="payment-method"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Payment Method
                </label>

                <select
                  id="payment-method"
                  name="method"
                  required
                  defaultValue="CASH"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="POS">POS</option>
                  <option value="ONLINE">Online</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="payment-reference"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Reference
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <input
                  id="payment-reference"
                  name="reference"
                  type="text"
                  placeholder="e.g. bank transfer reference"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="payment-notes"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Notes
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="payment-notes"
                  name="notes"
                  rows={3}
                  placeholder="Additional payment notes..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
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
                  className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
