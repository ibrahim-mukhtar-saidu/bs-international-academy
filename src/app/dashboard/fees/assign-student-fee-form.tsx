"use client";

import { useState } from "react";
import { assignStudentFee } from "./actions/assign-student-fee";

type Student = {
  id: string;
  name: string;
  admissionNo: string;
};

type FeeStructure = {
  id: string;
  name: string;
  amount: number;
};

type AcademicSession = {
  id: string;
  name: string;
  terms: {
    id: string;
    name: string;
    number: number;
  }[];
};

export default function AssignStudentFeeForm({
  students,
  feeStructures,
  sessions,
}: {
  students: Student[];
  feeStructures: FeeStructure[];
  sessions: AcademicSession[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedFeeId, setSelectedFeeId] = useState(
    feeStructures[0]?.id ?? "",
  );

  const [selectedSessionId, setSelectedSessionId] = useState(
    sessions[0]?.id ?? "",
  );

  const selectedFee = feeStructures.find(
    (fee) => fee.id === selectedFeeId,
  );

  const selectedSession = sessions.find(
    (academicSession) => academicSession.id === selectedSessionId,
  );

  async function handleSubmit(formData: FormData) {
    setError("");
    setSaving(true);

    try {
      await assignStudentFee(formData);
      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to assign fee.",
      );
      setSaving(false);
    }
  }

  if (
    students.length === 0 ||
    feeStructures.length === 0 ||
    sessions.length === 0
  ) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="rounded-xl border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
      >
        Assign Fee
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
                    Student Billing
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Assign Fee
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Assign a fee to a student for a specific academic term.
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
                  htmlFor="student-id"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Student
                </label>

                <select
                  id="student-id"
                  name="studentId"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  <option value="">Select student</option>

                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} — {student.admissionNo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="fee-structure-id"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Fee Structure
                </label>

                <select
                  id="fee-structure-id"
                  name="feeStructureId"
                  value={selectedFeeId}
                  onChange={(event) => setSelectedFeeId(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  {feeStructures.map((fee) => (
                    <option key={fee.id} value={fee.id}>
                      {fee.name} — ₦{fee.amount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="session-id"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Academic Session
                </label>

                <select
                  id="session-id"
                  name="sessionId"
                  value={selectedSessionId}
                  onChange={(event) =>
                    setSelectedSessionId(event.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  {sessions.map((academicSession) => (
                    <option
                      key={academicSession.id}
                      value={academicSession.id}
                    >
                      {academicSession.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="term-id"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Term
                </label>

                <select
                  id="term-id"
                  name="termId"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  <option value="">Select term</option>

                  {selectedSession?.terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="amount-due"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Amount Due
                </label>

                <div className="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10">
                  <span className="flex items-center bg-slate-50 px-4 text-sm font-semibold text-slate-600">
                    ₦
                  </span>

                  <input
                    id="amount-due"
                    name="amountDue"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    key={selectedFeeId}
                    defaultValue={
                      selectedFee
                        ? selectedFee.amount.toFixed(2)
                        : ""
                    }
                    className="w-full px-4 py-3 text-sm outline-none"
                  />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Defaulted from the selected fee structure. You can adjust
                  the amount if necessary.
                </p>
              </div>

              <div>
                <label
                  htmlFor="due-date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Due Date
                </label>

                <input
                  id="due-date"
                  name="dueDate"
                  type="date"
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
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Assigning..." : "Assign Fee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
