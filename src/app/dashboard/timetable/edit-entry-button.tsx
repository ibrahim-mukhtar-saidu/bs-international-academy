"use client";

import { useState } from "react";
import EditEntryForm from "./edit-entry-form";

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

type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

interface ExistingEntry {
  id: string;
  sessionId: string;
  classId: string;
  periodId: string;
  assignmentId: string;
  teacherId: string;
  day: DayOfWeek;
}

interface EditEntryButtonProps {
  entry: ExistingEntry;
  sessions: SessionOption[];
  classes: ClassOption[];
  periods: PeriodOption[];
  assignments: AssignmentOption[];
}

export default function EditEntryButton({
  entry,
  sessions,
  classes,
  periods,
  assignments,
}: EditEntryButtonProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <EditEntryForm
        entry={entry}
        sessions={sessions}
        classes={classes}
        periods={periods}
        assignments={assignments}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50"
    >
      Edit
    </button>
  );
}
