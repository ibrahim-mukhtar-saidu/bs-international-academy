import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-slate-950 text-white lg:block">
        <div className="border-b border-slate-800 px-6 py-6">
          <p className="text-sm font-semibold text-blue-400">
            BS INTERNATIONAL ACADEMY
          </p>
          <p className="mt-1 text-xs text-slate-400">
            School Management Portal
          </p>
        </div>

        <nav className="space-y-1 px-3 py-4">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/dashboard/students" label="Students" />
          <NavLink href="/dashboard/teachers" label="Teachers" />
          <NavLink href="/dashboard/teacher-assignments" label="Teacher Assignments" />
          <NavLink href="/dashboard/classes" label="Classes" />
          <NavLink href="/dashboard/subjects" label="Subjects" />
          <NavLink href="/dashboard/academic" label="Academic Structure" />
          <NavLink href="/dashboard/timetable" label="Timetable" />
          <NavLink href="/dashboard/assignments" label="Assignments" />
          <NavLink href="/dashboard/tests" label="Tests" />
          <NavLink href="/dashboard/examinations" label="Examinations" />
          <NavLink href="/dashboard/results" label="Results" />
          <NavLink href="/dashboard/scratch-cards" label="Scratch Cards" />
          <NavLink href="/dashboard/fees" label="Fees & Payments" />
          <NavLink href="/dashboard/attendance" label="Attendance" />
          <NavLink href="/dashboard/admissions" label="Admissions" />
          <NavLink href="/dashboard/announcements" label="Announcements" />
          <NavLink href="/dashboard/settings" label="Settings" />
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Signed in as
              </p>
              <p className="font-semibold text-slate-900">
                {session.user.name}
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              {session.user.role}
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
    >
      {label}
    </Link>
  );
}
