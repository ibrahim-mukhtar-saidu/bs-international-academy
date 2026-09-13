import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import EntryForm from "./entry-form";
import PeriodForm from "./period-form";
import TimetableGrid from "./timetable-grid";
import DeleteEntryButton from "./delete-entry-button";
import EditEntryButton from "./edit-entry-button";

export default async function TimetablePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        You do not have permission to access the timetable.
      </div>
    );
  }

  const [
    sessions,
    classes,
    periods,
    assignments,
    timetableEntries,
  ] = await Promise.all([
    prisma.academicSession.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        startYear: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.schoolClass.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        code: true,
        sessionId: true,
      },
    }),

    prisma.timetablePeriod.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        order: true,
      },
    }),

    prisma.teacherAssignment.findMany({
      where: {
        teacher: {
          schoolId: session.user.schoolId,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        teacherId: true,
        sessionId: true,
        classId: true,
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        teacher: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    }),

    prisma.timetableEntry.findMany({
      where: {
        session: {
          schoolId: session.user.schoolId,
        },
      },
      orderBy: [
        {
          day: "asc",
        },
        {
          period: {
            order: "asc",
          },
        },
      ],
      select: {
        id: true,
        day: true,
        sessionId: true,
        classId: true,
        periodId: true,
        assignmentId: true,
        teacherId: true,
        period: {
          select: {
            name: true,
            startTime: true,
            endTime: true,
            order: true,
          },
        },
        schoolClass: {
          select: {
            name: true,
            code: true,
          },
        },
        assignment: {
          select: {
            id: true,
            sessionId: true,
            classId: true,
            teacherId: true,
            subject: {
              select: {
                name: true,
                code: true,
              },
            },
            teacher: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const assignmentOptions = assignments.map((assignment) => ({
    id: assignment.id,
    teacherId: assignment.teacherId,
    sessionId: assignment.sessionId,
    classId: assignment.classId,
    subjectName: assignment.subject.name,
    subjectCode: assignment.subject.code,
    teacherName: `${assignment.teacher.user.firstName} ${assignment.teacher.user.lastName}`,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Timetable
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Configure teaching periods and manage class timetables.
        </p>
      </div>

      <PeriodForm />

      <EntryForm
        sessions={sessions}
        classes={classes}
        periods={periods}
        assignments={assignmentOptions}
      />

      <TimetableGrid
        sessions={sessions}
        classes={classes}
        periods={periods}
        entries={timetableEntries}
      />

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Timetable Periods
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {periods.length}{" "}
            {periods.length === 1 ? "period" : "periods"} configured
          </p>
        </div>

        {periods.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No timetable periods have been created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Period
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Start
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    End
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {periods.map((period) => (
                  <tr key={period.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {period.order}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {period.name}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {period.startTime}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {period.endTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Timetable Entries
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {timetableEntries.length}{" "}
            {timetableEntries.length === 1
              ? "entry"
              : "entries"}{" "}
            scheduled
          </p>
        </div>

        {timetableEntries.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No timetable entries have been created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Day
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Period
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Class
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Subject
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Teacher
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {timetableEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {entry.day}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {entry.period.name}{" "}
                      ({entry.period.startTime}–
                      {entry.period.endTime})
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {entry.schoolClass.name} (
                      {entry.schoolClass.code})
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {entry.assignment.subject.name} (
                      {entry.assignment.subject.code})
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {entry.assignment.teacher.user.firstName}{" "}
                      {entry.assignment.teacher.user.lastName}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <EditEntryButton
                          entry={{
                            id: entry.id,
                            sessionId: entry.sessionId,
                            classId: entry.classId,
                            periodId: entry.periodId,
                            assignmentId: entry.assignmentId,
                            teacherId: entry.teacherId,
                            day: entry.day,
                          }}
                          sessions={sessions.map((academicSession) => ({
                            id: academicSession.id,
                            name: academicSession.name,
                          }))}
                          classes={classes.map((schoolClass) => ({
                            id: schoolClass.id,
                            name: schoolClass.name,
                            code: schoolClass.code,
                            sessionId: schoolClass.sessionId,
                          }))}
                          periods={periods.map((period) => ({
                            id: period.id,
                            name: period.name,
                            startTime: period.startTime,
                            endTime: period.endTime,
                            order: period.order,
                          }))}
                          assignments={assignments.map((assignment) => ({
                            id: assignment.id,
                            sessionId: assignment.sessionId,
                            classId: assignment.classId,
                            teacherId: assignment.teacherId,
                            teacherName: `${assignment.teacher.user.firstName} ${assignment.teacher.user.lastName}`,
                            subjectName: assignment.subject.name,
                            subjectCode: assignment.subject.code,
                          }))}
                        />

                        <DeleteEntryButton entryId={entry.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
