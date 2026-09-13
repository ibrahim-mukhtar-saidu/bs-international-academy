import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const schoolId = session.user.schoolId;

  const [studentCount, teacherCount, classCount, subjectCount] =
    await Promise.all([
      prisma.studentProfile.count({
        where: { schoolId },
      }),
      prisma.teacherProfile.count({
        where: { schoolId },
      }),
      prisma.schoolClass.count({
        where: { schoolId },
      }),
      prisma.subject.count({
        where: { schoolId },
      }),
    ]);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-blue-700">
              BS INTERNATIONAL ACADEMY
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              School Management Portal
            </h1>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              {session.user.name}
            </p>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {session.user.role}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-blue-700">
            Welcome back
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {session.user.name}
          </h2>

          <p className="mt-2 text-slate-600">
            You are signed in as an administrator of BS INTERNATIONAL
            ACADEMY.
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Students" value={studentCount} />
          <DashboardCard title="Teachers" value={teacherCount} />
          <DashboardCard title="Classes" value={classCount} />
          <DashboardCard title="Subjects" value={subjectCount} />
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            System status
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <StatusRow label="Authentication" status="Connected" />
            <StatusRow label="Database" status="Connected" />
            <StatusRow label="School" status="BS INTERNATIONAL ACADEMY" />
            <StatusRow label="Role" status={session.user.role} />
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusRow({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-emerald-600">{status}</span>
    </div>
  );
}
