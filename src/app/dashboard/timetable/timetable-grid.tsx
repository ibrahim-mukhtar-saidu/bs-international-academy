"use client";

import { useMemo, useState } from "react";

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

interface TimetableEntryOption {
  id: string;
  day: DayOfWeek;
  sessionId: string;
  classId: string;
  periodId: string;
  period: {
    name: string;
    startTime: string;
    endTime: string;
    order: number;
  };
  assignment: {
    subject: {
      name: string;
      code: string;
    };
    teacher: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

interface TimetableGridProps {
  sessions: SessionOption[];
  classes: ClassOption[];
  periods: PeriodOption[];
  entries: TimetableEntryOption[];
}

const days: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
];

export default function TimetableGrid({
  sessions,
  classes,
  periods,
  entries,
}: TimetableGridProps) {
  const [sessionId, setSessionId] = useState(
    sessions[0]?.id ?? "",
  );

  const classesForSession = useMemo(
    () =>
      classes.filter(
        (schoolClass) => schoolClass.sessionId === sessionId,
      ),
    [classes, sessionId],
  );

  const [classId, setClassId] = useState(
    classesForSession[0]?.id ?? "",
  );

  const selectedClass = classesForSession.find(
    (schoolClass) => schoolClass.id === classId,
  );

  const classEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.sessionId === sessionId &&
          entry.classId === classId,
      ),
    [entries, sessionId, classId],
  );

  const getEntry = (
    day: DayOfWeek,
    periodId: string,
  ) =>
    classEntries.find(
      (entry) =>
        entry.day === day &&
        entry.periodId === periodId,
    );

  function handleSessionChange(
    nextSessionId: string,
  ) {
    setSessionId(nextSessionId);

    const nextClasses = classes.filter(
      (schoolClass) =>
        schoolClass.sessionId === nextSessionId,
    );

    setClassId(nextClasses[0]?.id ?? "");
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Class Timetable
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select an academic session and class to view the
          teaching timetable.
        </p>
      </div>

      <div className="grid gap-4 border-b border-gray-200 p-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="timetable-grid-session"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Academic Session
          </label>

          <select
            id="timetable-grid-session"
            value={sessionId}
            onChange={(event) =>
              handleSessionChange(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {sessions.length === 0 ? (
              <option value="">No sessions available</option>
            ) : (
              sessions.map((academicSession) => (
                <option
                  key={academicSession.id}
                  value={academicSession.id}
                >
                  {academicSession.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="timetable-grid-class"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Class
          </label>

          <select
            id="timetable-grid-class"
            value={classId}
            onChange={(event) =>
              setClassId(event.target.value)
            }
            disabled={classesForSession.length === 0}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          >
            {classesForSession.length === 0 ? (
              <option value="">
                No classes available
              </option>
            ) : (
              classesForSession.map((schoolClass) => (
                <option
                  key={schoolClass.id}
                  value={schoolClass.id}
                >
                  {schoolClass.name} ({schoolClass.code})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedClass && periods.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 z-10 min-w-[170px] border-r border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Period
                </th>

                {days.map((day) => (
                  <th
                    key={day.value}
                    className="min-w-[150px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {periods.map((period) => (
                <tr key={period.id}>
                  <td className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-4 align-top">
                    <div className="text-sm font-semibold text-gray-900">
                      {period.name}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      {period.startTime}–{period.endTime}
                    </div>
                  </td>

                  {days.map((day) => {
                    const entry = getEntry(
                      day.value,
                      period.id,
                    );

                    return (
                      <td
                        key={`${period.id}-${day.value}`}
                        className="border-r border-gray-100 px-3 py-3 align-top"
                      >
                        {entry ? (
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {entry.assignment.subject.name}
                            </div>

                            <div className="mt-1 text-xs font-medium text-gray-600">
                              {entry.assignment.subject.code}
                            </div>

                            <div className="mt-2 text-xs text-gray-700">
                              {
                                entry.assignment.teacher.user
                                  .firstName
                              }{" "}
                              {
                                entry.assignment.teacher.user
                                  .lastName
                              }
                            </div>
                          </div>
                        ) : (
                          <div className="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-10 text-center text-sm text-gray-500">
          {periods.length === 0
            ? "Create timetable periods before viewing the class timetable."
            : "Select a class to view its timetable."}
        </div>
      )}

      {selectedClass && (
        <div className="border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">
            Viewing timetable for{" "}
            <span className="font-semibold text-gray-900">
              {selectedClass.name} ({selectedClass.code})
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
