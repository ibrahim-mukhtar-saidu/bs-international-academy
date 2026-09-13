"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTimetableEntry } from "./actions/update-entry";

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
  sessionId: string;
  classId: string;
  teacherId: string;
  teacherName: string;
  subjectName: string;
  subjectCode: string;
}

interface ExistingEntry {
  id: string;
  sessionId: string;
  classId: string;
  periodId: string;
  assignmentId: string;
  teacherId: string;
  day: DayOfWeek;
}

interface EditEntryFormProps {
  entry: ExistingEntry;
  sessions: SessionOption[];
  classes: ClassOption[];
  periods: PeriodOption[];
  assignments: AssignmentOption[];
  onClose: () => void;
}

const days: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
];

export default function EditEntryForm({
  entry,
  sessions,
  classes,
  periods,
  assignments,
  onClose,
}: EditEntryFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [sessionId, setSessionId] = useState(entry.sessionId);
  const [classId, setClassId] = useState(entry.classId);
  const [day, setDay] = useState<DayOfWeek>(entry.day);
  const [periodId, setPeriodId] = useState(entry.periodId);
  const [assignmentId, setAssignmentId] = useState(entry.assignmentId);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const classesForSession = useMemo(
    () =>
      classes.filter(
        (schoolClass) => schoolClass.sessionId === sessionId,
      ),
    [classes, sessionId],
  );

  const assignmentsForClass = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.sessionId === sessionId &&
          assignment.classId === classId,
      ),
    [assignments, sessionId, classId],
  );

  function handleSessionChange(nextSessionId: string) {
    setSessionId(nextSessionId);

    const nextClasses = classes.filter(
      (schoolClass) =>
        schoolClass.sessionId === nextSessionId,
    );

    const nextClassId = nextClasses[0]?.id ?? "";

    setClassId(nextClassId);

    const nextAssignments = assignments.filter(
      (assignment) =>
        assignment.sessionId === nextSessionId &&
        assignment.classId === nextClassId,
    );

    setAssignmentId(nextAssignments[0]?.id ?? "");
  }

  function handleClassChange(nextClassId: string) {
    setClassId(nextClassId);

    const nextAssignments = assignments.filter(
      (assignment) =>
        assignment.sessionId === sessionId &&
        assignment.classId === nextClassId,
    );

    setAssignmentId(nextAssignments[0]?.id ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const selectedAssignment = assignments.find(
        (assignment) => assignment.id === assignmentId,
      );

      if (!selectedAssignment) {
        throw new Error("Please select a teacher and subject");
      }

      await updateTimetableEntry({
        entryId: entry.id,
        sessionId,
        classId,
        periodId,
        assignmentId,
        teacherId: selectedAssignment.teacherId,
        day,
      });

      setSuccess("Timetable entry updated successfully");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update timetable entry",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Edit Timetable Entry
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Update the session, class, day, period, or teacher assignment.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-2"
      >
        <div>
          <label
            htmlFor={`edit-session-${entry.id}`}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Academic Session
          </label>

          <select
            id={`edit-session-${entry.id}`}
            value={sessionId}
            onChange={(event) =>
              handleSessionChange(event.target.value)
            }
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
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
            htmlFor={`edit-class-${entry.id}`}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Class
          </label>

          <select
            id={`edit-class-${entry.id}`}
            value={classId}
            onChange={(event) =>
              handleClassChange(event.target.value)
            }
            disabled={saving || classesForSession.length === 0}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100"
          >
            {classesForSession.map((schoolClass) => (
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
            htmlFor={`edit-day-${entry.id}`}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Day
          </label>

          <select
            id={`edit-day-${entry.id}`}
            value={day}
            onChange={(event) =>
              setDay(event.target.value as DayOfWeek)
            }
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          >
            {days.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`edit-period-${entry.id}`}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Period
          </label>

          <select
            id={`edit-period-${entry.id}`}
            value={periodId}
            onChange={(event) =>
              setPeriodId(event.target.value)
            }
            disabled={saving || periods.length === 0}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100"
          >
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name} ({period.startTime}–{period.endTime})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor={`edit-assignment-${entry.id}`}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Teacher & Subject
          </label>

          <select
            id={`edit-assignment-${entry.id}`}
            value={assignmentId}
            onChange={(event) =>
              setAssignmentId(event.target.value)
            }
            disabled={saving || assignmentsForClass.length === 0}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100"
          >
            {assignmentsForClass.length === 0 ? (
              <option value="">
                No teacher assignments available
              </option>
            ) : (
              assignmentsForClass.map((assignment) => (
                <option
                  key={assignment.id}
                  value={assignment.id}
                >
                  {assignment.subjectName} ({assignment.subjectCode}) —{" "}
                  {assignment.teacherName}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {success && (
            <span className="text-sm text-green-700">
              {success}
            </span>
          )}

          {error && (
            <span className="text-sm text-red-700">
              {error}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
