import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import SchoolSettingsForm from "./school-settings-form";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    redirect("/dashboard");
  }

  const school = await prisma.school.findUnique({
    where: {
      id: session.user.schoolId,
    },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      phone: true,
      email: true,
      website: true,
      logoUrl: true,
    },
  });

  if (!school) {
    throw new Error("School record not found.");
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl bg-slate-950 px-5 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-7">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            System configuration
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Manage your school profile and the information displayed
            throughout the BS International Academy portal.
          </p>
        </div>
      </section>

      <SchoolSettingsForm school={school} />
    </main>
  );
}
