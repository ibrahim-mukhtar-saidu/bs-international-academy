"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { manageAnnouncement } from "./actions/manage-announcement";

type Announcement = {
  id: string;
  title: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  audience:
    | "ALL"
    | "ADMIN"
    | "PRINCIPAL"
    | "TEACHER"
    | "STUDENT"
    | "PARENT";
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  session: {
    name: string;
  } | null;
  createdBy: {
    name: string | null;
  };
};

type AnnouncementListProps = {
  announcements: Announcement[];
};

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-amber-100 text-amber-700",
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const audienceLabels = {
  ALL: "Everyone",
  ADMIN: "Administrators",
  PRINCIPAL: "Principals",
  TEACHER: "Teachers",
  STUDENT: "Students",
  PARENT: "Parents",
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AnnouncementList({
  announcements,
}: AnnouncementListProps) {
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED"
  >("ALL");

  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  async function handleAction(
    announcementId: string,
    action: "PUBLISH" | "ARCHIVE" | "DELETE",
  ) {
    const confirmed =
      action !== "DELETE" ||
      window.confirm(
        "Are you sure you want to permanently delete this announcement?",
      );

    if (!confirmed) return;

    try {
      setBusyId(announcementId);

      await manageAnnouncement({
        announcementId,
        action,
      });

      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to update the announcement.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return announcements.filter((announcement) => {
      const matchesStatus =
        statusFilter === "ALL" || announcement.status === statusFilter;

      const matchesSearch =
        !query ||
        announcement.title.toLowerCase().includes(query) ||
        announcement.content.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [announcements, search, statusFilter]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
            Announcement history
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
            School announcements
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View published notices, drafts, and archived announcements.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search announcements..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "ALL"
                  | "DRAFT"
                  | "PUBLISHED"
                  | "ARCHIVED",
              )
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          >
            <option value="ALL">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Drafts</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No announcements found.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Create an announcement or change the current filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[announcement.status]}`}
                      >
                        {announcement.status}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${priorityStyles[announcement.priority]}`}
                      >
                        {announcement.priority}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-slate-950 sm:text-lg">
                      {announcement.title}
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {announcement.content}
                    </p>
                  </div>

                  <div className="shrink-0 text-left lg:text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Audience
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {audienceLabels[announcement.audience]}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="font-bold uppercase tracking-wide text-slate-400">
                      Session
                    </p>

                    <p className="mt-1 font-medium text-slate-700">
                      {announcement.session?.name ?? "All sessions"}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold uppercase tracking-wide text-slate-400">
                      Published
                    </p>

                    <p className="mt-1 font-medium text-slate-700">
                      {formatDate(announcement.publishedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold uppercase tracking-wide text-slate-400">
                      Expires
                    </p>

                    <p className="mt-1 font-medium text-slate-700">
                      {formatDate(announcement.expiresAt)}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold uppercase tracking-wide text-slate-400">
                      Created by
                    </p>

                    <p className="mt-1 font-medium text-slate-700">
                      {announcement.createdBy.name ?? "Unknown user"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-4">
                  {announcement.status === "DRAFT" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(announcement.id, "PUBLISH")
                      }
                      disabled={busyId === announcement.id}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyId === announcement.id
                        ? "Working..."
                        : "Publish"}
                    </button>
                  )}

                  {announcement.status === "PUBLISHED" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(announcement.id, "ARCHIVE")
                      }
                      disabled={busyId === announcement.id}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyId === announcement.id
                        ? "Working..."
                        : "Archive"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleAction(announcement.id, "DELETE")
                    }
                    disabled={busyId === announcement.id}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busyId === announcement.id
                      ? "Working..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
