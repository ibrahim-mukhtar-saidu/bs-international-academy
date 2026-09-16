import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import AnnouncementForm from "./announcement-form";
import AnnouncementList from "./announcement-list";

export default async function AnnouncementsPage() {
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

  const [academicSessions, announcements] = await Promise.all([
    prisma.academicSession.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: [
        {
          isCurrent: "desc",
        },
        {
          startYear: "desc",
        },
        {
          endYear: "desc",
        },
      ],
    }),

    prisma.announcement.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        priority: true,
        audience: true,
        publishedAt: true,
        expiresAt: true,
        createdAt: true,
        session: {
          select: {
            name: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const stats = {
    total: announcements.length,
    published: announcements.filter(
      (announcement) => announcement.status === "PUBLISHED",
    ).length,
    drafts: announcements.filter(
      (announcement) => announcement.status === "DRAFT",
    ).length,
    urgent: announcements.filter(
      (announcement) =>
        announcement.priority === "URGENT" &&
        announcement.status === "PUBLISHED",
    ).length,
  };

  const serializedAnnouncements = announcements.map((announcement) => ({
    ...announcement,
    publishedAt: announcement.publishedAt?.toISOString() ?? null,
    expiresAt: announcement.expiresAt?.toISOString() ?? null,
    createdAt: announcement.createdAt.toISOString(),
    createdBy: {
      name: `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`.trim(),
    },
  }));

  return (
    <main className="space-y-6">
      <section className="rounded-3xl bg-slate-950 px-5 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-7">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Communication centre
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Announcements
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Keep students, parents, teachers, and school leadership informed
            with clear and timely school-wide updates.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Total
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {stats.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            All announcements
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
            Published
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-800">
            {stats.published}
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Currently published
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Drafts
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {stats.drafts}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Waiting to be published
          </p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-red-600">
            Urgent
          </p>
          <p className="mt-2 text-3xl font-black text-red-800">
            {stats.urgent}
          </p>
          <p className="mt-1 text-xs text-red-700">
            Published urgent notices
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <AnnouncementForm sessions={academicSessions} />

        <AnnouncementList announcements={serializedAnnouncements} />
      </div>
    </main>
  );
}
