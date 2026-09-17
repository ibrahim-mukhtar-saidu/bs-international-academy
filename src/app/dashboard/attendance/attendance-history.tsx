"use client";

import { useCallback, useEffect, useState } from "react";
import AttendanceSummary from "./attendance-summary";

type AttendanceRecord = {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  notes: string | null;
  studentName: string;
  admissionNo: string;
  className: string;
  classCode: string;
  sessionName: string;
  termName: string;
};

type AttendanceHistoryProps = {
  classes: {
    id: string;
    name: string;
    code: string;
  }[];
};

const statusStyles = {
  PRESENT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ABSENT: "border-red-200 bg-red-50 text-red-700",
  LATE: "border-amber-200 bg-amber-50 text-amber-700",
  EXCUSED: "border-blue-200 bg-blue-50 text-blue-700",
};

const statusLabels = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

export default function AttendanceHistory({
  classes,
}: AttendanceHistoryProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (classId) {
        params.set("classId", classId);
      }

      if (date) {
        params.set("date", date);
      }

      const response = await fetch(
        `/api/dashboard/attendance/history?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load attendance history.");
      }

      setRecords(data.records ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load attendance history.",
      );
    } finally {
      setLoading(false);
    }
  }, [classId, date]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHistory();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadHistory]);

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Attendance records
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">
            Attendance History
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review previously recorded student attendance.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="text-sm font-medium text-slate-700">
            Class
            <select
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              className="mt-1 block w-full min-w-48 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
            >
              <option value="">All classes</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name} ({schoolClass.code})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
            />
          </label>

          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
            className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <AttendanceSummary
        classId={classId}
        date={date}
      />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Class</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Notes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record.id} className="bg-white">
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {record.date}
                </td>

                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-900">
                    {record.studentName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {record.admissionNo}
                  </div>
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {record.className}
                  <div className="text-xs text-slate-400">
                    {record.sessionName} · {record.termName}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[record.status]}`}
                  >
                    {statusLabels[record.status]}
                  </span>
                </td>

                <td className="max-w-xs px-4 py-4 text-slate-500">
                  {record.notes || "—"}
                </td>
              </tr>
            ))}

            {!loading && records.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-slate-500"
                >
                  No attendance records found for the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-slate-400">
        Showing up to 200 recent attendance records.
      </div>
    </section>
  );
}
