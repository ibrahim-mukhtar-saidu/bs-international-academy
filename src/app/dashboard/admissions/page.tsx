import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdmissionForm from "./admission-form";
import AdmissionList from "./admission-list";

export default async function AdmissionsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        You do not have permission to access admissions management.
      </div>
    );
  }

  const [academicSessions, sections, classes] = await Promise.all([
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

    prisma.section.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        type: true,
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
        sectionId: true,
        sessionId: true,
      },
    }),
  ]);

  const [
    totalApplications,
    pendingApplications,
    underReviewApplications,
    approvedApplications,
  ] = await Promise.all([
    prisma.admissionApplication.count({
      where: {
        schoolId: session.user.schoolId,
      },
    }),

    prisma.admissionApplication.count({
      where: {
        schoolId: session.user.schoolId,
        status: "PENDING",
      },
    }),

    prisma.admissionApplication.count({
      where: {
        schoolId: session.user.schoolId,
        status: "UNDER_REVIEW",
      },
    }),

    prisma.admissionApplication.count({
      where: {
        schoolId: session.user.schoolId,
        status: "APPROVED",
      },
    }),
  ]);

  const applications = await prisma.admissionApplication.findMany({
    where: {
      schoolId: session.user.schoolId,
    },
    orderBy: {
      submittedAt: "desc",
    },
    select: {
      id: true,
      reference: true,
      status: true,
      studentId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      submittedAt: true,
      session: {
        select: {
          name: true,
        },
      },
      section: {
        select: {
          name: true,
        },
      },
      schoolClass: {
        select: {
          name: true,
          code: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
          Student Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Admissions
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Manage student admission applications from initial submission through
          review and approval.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Applications
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalApplications}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">
            Pending
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {pendingApplications}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">
            Under Review
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {underReviewApplications}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">
            Approved
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {approvedApplications}
          </p>
        </div>
      </div>

      <AdmissionForm
        academicSessions={academicSessions}
        sections={sections}
        classes={classes}
      />

      <AdmissionList applications={applications} />
    </div>
  );
}
