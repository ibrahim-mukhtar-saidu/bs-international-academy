"use client";

import { useMemo, useState } from "react";
import { saveAttendance } from "./actions/save-attendance";

type AcademicSession = {
  id: string;
  name: string;
  isCurrent: boolean;
};

type Term = {
  id: string;
  name: string;
  number: number;
  sessionId: string;
  isCurrent: boolean;
};

type SchoolClass = {
  id: string;
  name: string;
  code: string;
  sessionId: string;
};

type Student = {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  status: string;
};

type AttendanceFormProps = {
  academicSessions: AcademicSession[];
  terms: Term[];
  classes: SchoolClass[];
};

const statusOptions = [
  {
    value: "PRESENT",
    label: "Present",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "ABSENT",
    label: "Absent",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  {
    value: "LATE",
    label: "Late",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    value: "EXCUSED",
    label: "Excused",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
] as const;

export default function AttendanceForm({
  academicSessions,
  terms,
  classes,
}: AttendanceFormProps) {
  const currentSession =
    academicSessions.find((item) => item.isCurrent) ??
    academicSessions[0];

  const currentTerm =
    terms.find(
      (item) =>
        item.sessionId === currentSession?.id && item.isCurrent,
    ) ??
    terms.find(
      (item) => item.sessionId === currentSession?.id,
    );

  const [sessionId, setSessionId] = useState(
    currentSession?.id ?? "",
  );

  const [termId, setTermId] = useState(
    currentTerm?.id ?? "",
  );

  const [classId, setClassId] = useState("");

  const [date, setDate] = useState(() => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredTerms = useMemo(
    () => terms.filter((term) => term.sessionId === sessionId),
    [terms, sessionId],
  );

  const filteredClasses = useMemo(
    () =>
      classes.filter(
        (schoolClass) => schoolClass.sessionId === sessionId,
      ),
    [classes, sessionId],
  );

  async function loadStudents() {
    setError("");
    setSuccess("");

    if (!sessionId || !termId || !classId || !date) {
      setError(
        "Select an academic session, term, class, and date first.",
      );
      return;
    }

    setLoadingStudents(true);

    try {
      const response = await fetch(
        `/api/dashboard/attendance/students?classId=${encodeURIComponent(
          classId,
        )}&sessionId=${encodeURIComponent(
          sessionId,
        )}&termId=${encodeURIComponent(termId)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Unable to load students.",
        );
      }

      setStudents(data.students ?? []);
    } catch (error) {
      setStudents([]);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load students.",
      );
    } finally {
      setLoadingStudents(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      for (const student of students) {
        const status = formData.get(
          `status-${student.id}`,
        );

        const notes = formData.get(
          `notes-${student.id}`,
        );

        const attendanceData = new FormData();

        attendanceData.set("classId", classId);
        attendanceData.set("sessionId", sessionId);
        attendanceData.set("termId", termId);
        attendanceData.set("studentId", student.id);
        attendanceData.set("date", date);
        attendanceData.set(
          "status",
          String(status ?? "PRESENT"),
        );
        attendanceData.set(
          "notes",
          String(notes ?? ""),
        );

        await saveAttendance(attendanceData);
      }

      setSuccess(
        `Attendance saved successfully for ${students.length} student${
          students.length === 1 ? "" : "s"
        }.`,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save attendance.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
          Daily Register
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-950">
          Mark Attendance
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose the academic period and class, then mark each
          student.
        </p>
      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="attendance-session"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Academic Session
          </label>

          <select
            id="attendance-session"
            value={sessionId}
            onChange={(event) => {
              const nextSessionId = event.target.value;

              setSessionId(nextSessionId);

              const nextTerm =
                terms.find(
                  (term) =>
                    term.sessionId === nextSessionId &&
                    term.isCurrent,
                ) ??
                terms.find(
                  (term) =>
                    term.sessionId === nextSessionId,
                );

              setTermId(nextTerm?.id ?? "");
              setClassId("");
              setStudents([]);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
          >
            {academicSessions.length === 0 ? (
              <option value="">No sessions available</option>
            ) : (
              academicSessions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.isCurrent ? " · Current" : ""}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="attendance-term"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Term
          </label>

          <select
            id="attendance-term"
            value={termId}
            onChange={(event) => {
              setTermId(event.target.value);
              setStudents([]);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
          >
            {filteredTerms.length === 0 ? (
              <option value="">No terms available</option>
            ) : (
              filteredTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                  {term.isCurrent ? " · Current" : ""}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="attendance-class"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Class
          </label>

          <select
            id="attendance-class"
            value={classId}
            onChange={(event) => {
              setClassId(event.target.value);
              setStudents([]);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
          >
            <option value="">Select class</option>

            {filteredClasses.map((schoolClass) => (
              <option
                key={schoolClass.id}
                value={schoolClass.id}
              >
                {schoolClass.name} ({schoolClass.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="attendance-date"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Date
          </label>

          <input
            id="attendance-date"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setStudents([]);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
          />
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-5">
        <button
          type="button"
          onClick={loadStudents}
          disabled={loadingStudents}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingStudents
            ? "Loading Students..."
            : "Load Students"}
        </button>
      </div>

      {error && (
        <div className="mx-6 mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mx-6 mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {students.length > 0 && (
        <form
          action={handleSubmit}
          className="border-t border-slate-200"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">
                    Student
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Admission No.
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Attendance
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {student.firstName}{" "}
                        {student.lastName}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {student.admissionNo}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((option) => (
                          <label
                            key={option.value}
                            className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition has-[:checked]:ring-2 has-[:checked]:ring-cyan-500/30 ${option.className}`}
                          >
                            <input
                              type="radio"
                              name={`status-${student.id}`}
                              value={option.value}
                              defaultChecked={
                                option.value === "PRESENT"
                              }
                              className="sr-only"
                            />

                            {option.label}
                          </label>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="text"
                        name={`notes-${student.id}`}
                        placeholder="Optional note"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {students.length} student
              {students.length === 1 ? "" : "s"} loaded.
              Default status is Present.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Attendance..."
                : "Save Attendance"}
            </button>
          </div>
        </form>
      )}

      {!loadingStudents &&
        students.length === 0 &&
        !error && (
          <div className="border-t border-slate-200 p-10 text-center">
            <p className="font-semibold text-slate-900">
              No students loaded
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Select a session, term, class, and date, then
              click Load Students.
            </p>
          </div>
        )}
    </div>
  );
}
