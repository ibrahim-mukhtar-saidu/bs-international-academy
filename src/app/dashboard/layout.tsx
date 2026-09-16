import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import DashboardSidebar from "./components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const school = await prisma.school.findUnique({
    where: {
      id: session.user.schoolId,
    },
    select: {
      name: true,
      code: true,
    },
  });

  if (!school) {
    throw new Error("School record not found.");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <DashboardSidebar
        schoolName={school.name}
        schoolCode={school.code}
        userName={session.user.name}
        role={session.user.role}
      />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 pl-20 sm:px-7 sm:pl-20 lg:px-8 lg:pl-8">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
                School Management Portal
              </p>

              <p className="mt-1 truncate text-lg font-black tracking-tight text-slate-950">
                {school.name}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-900">
                  {session.user.name}
                </p>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {session.user.role}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-cyan-300 shadow-sm">
                {(session.user.name || "U")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
