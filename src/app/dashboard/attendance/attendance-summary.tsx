"use client";

import { useEffect, useState } from "react";

type AttendanceSummaryProps = {
  classId: string;
  date: string;
};

type Summary = {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
};

export default function AttendanceSummary({
  classId,
  date,
}: AttendanceSummaryProps) {
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendanceRate: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
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
          `/api/dashboard/attendance/summary?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "Failed to load attendance summary.",
          );
        }

        setSummary(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load attendance summary.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [classId, date]);

  const cards = [
    {
      label: "Total",
      value: summary.total,
      description: "Attendance records",
      className: "border-slate-200 bg-white",
    },
    {
      label: "Present",
      value: summary.present,
      description: "Students present",
      className: "border-emerald-200 bg-emerald-50/70",
    },
    {
      label: "Absent",
      value: summary.absent,
      description: "Students absent",
      className: "border-red-200 bg-red-50/70",
    },
    {
      label: "Late",
      value: summary.late,
      description: "Students late",
      className: "border-amber-200 bg-amber-50/70",
    },
    {
      label: "Excused",
      value: summary.excused,
      description: "Excused absences",
      className: "border-blue-200 bg-blue-50/70",
    },
    {
      label: "Rate",
      value: `${summary.attendanceRate}%`,
      description: "Present + late",
      className: "border-cyan-200 bg-cyan-50/70",
    },
  ];

  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
          Attendance overview
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">
          Attendance Summary
        </h2>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border p-5 shadow-sm ${card.className}`}
            >
              <p className="text-sm font-medium text-slate-500">
                {card.label}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {loading ? "—" : card.value}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
