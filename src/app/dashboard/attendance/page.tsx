import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AttendanceForm from "./attendance-form";
import AttendanceHistory from "./attendance-history";

export default async function AttendancePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL" &&
    session.user.role !== "TEACHER"
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        You do not have permission to access attendance management.
      </div>
    );
  }

  const [academicSessions, terms, classes] = await Promise.all([
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
        isCurrent: true,
      },
    }),

    prisma.term.findMany({
      where: {
        session: {
          schoolId: session.user.schoolId,
        },
      },
      orderBy: [
        {
          session: {
            startYear: "desc",
          },
        },
        {
          number: "asc",
        },
      ],
      select: {
        id: true,
        name: true,
        number: true,
        sessionId: true,
        isCurrent: true,
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
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
          Student Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Attendance
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Record and manage daily student attendance by class, academic
          session, and term.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Academic Sessions
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {academicSessions.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Terms
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {terms.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Classes
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {classes.length}
          </p>
        </div>
      </div>

      <AttendanceForm
        academicSessions={academicSessions}
        terms={terms}
        classes={classes}
      />

      <AttendanceHistory
        classes={classes.map((schoolClass) => ({
          id: schoolClass.id,
          name: schoolClass.name,
          code: schoolClass.code,
        }))}
      />
    </div>
  );
}
