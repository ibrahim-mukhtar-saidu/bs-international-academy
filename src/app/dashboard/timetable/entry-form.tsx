"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createTimetableEntry } from "./actions/create-entry";

type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

interface SessionOption {
  id: string;
  name: string;
}

interface ClassOption {
  id: string;
  name: string;
  code: string;
  sessionId: string;
}

interface PeriodOption {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  order: number;
}

interface AssignmentOption {
  id: string;
  teacherId: string;
  sessionId: string;
  classId: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
}

interface EntryFormProps {
  sessions: SessionOption[];
  classes: ClassOption[];
  periods: PeriodOption[];
  assignments: AssignmentOption[];
}

const days: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
];

export default function EntryForm({
  sessions,
  classes,
  periods,
  assignments,
}: EntryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [sessionId, setSessionId] = useState(
    sessions[0]?.id ?? "",
  );
  const [classId, setClassId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredClasses = useMemo(
    () => classes.filter((schoolClass) => schoolClass.sessionId === sessionId),
    [classes, sessionId],
  );

  const filteredAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.sessionId === sessionId &&
          assignment.classId === classId,
      ),
    [assignments, sessionId, classId],
  );

  function handleSessionChange(value: string) {
    setSessionId(value);
    setClassId("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const selectedAssignmentId = String(
      formData.get("assignmentId") ?? "",
    );

    const selectedAssignment = filteredAssignments.find(
      (assignment) => assignment.id === selectedAssignmentId,
    );

    if (!selectedAssignment) {
      setError("Please select a valid teacher assignment.");
      setSubmitting(false);
      return;
    }

    try {
      await createTimetableEntry({
        sessionId,
        classId,
        periodId: String(formData.get("periodId") ?? ""),
        assignmentId: selectedAssignment.id,
        teacherId: selectedAssignment.teacherId,
        day: String(formData.get("day") ?? "") as DayOfWeek,
      });

      setMessage("Timetable entry created successfully.");
      formRef.current?.reset();
      setClassId("");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create timetable entry.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Add Timetable Entry
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Assign a teacher and subject to a class timetable slot.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label
            htmlFor="sessionId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Academic Session
          </label>

          <select
            id="sessionId"
            value={sessionId}
            onChange={(event) =>
              handleSessionChange(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select session</option>

            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="classId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Class
          </label>

          <select
            id="classId"
            name="classId"
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select class</option>

            {filteredClasses.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name} ({schoolClass.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="day"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Day
          </label>

          <select
            id="day"
            name="day"
            defaultValue=""
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select day</option>

            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="periodId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Period
          </label>

          <select
            id="periodId"
            name="periodId"
            defaultValue=""
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select period</option>

            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name} ({period.startTime}–{period.endTime})
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="assignmentId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Teacher & Subject
          </label>

          <select
            id="assignmentId"
            name="assignmentId"
            defaultValue=""
            disabled={!classId}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            required
          >
            <option value="">
              {classId
                ? "Select teacher and subject"
                : "Select a class first"}
            </option>

            {filteredAssignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.subjectName} ({assignment.subjectCode}) —{" "}
                {assignment.teacherName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creating..." : "Create Timetable Entry"}
      </button>
    </form>
  );
}
