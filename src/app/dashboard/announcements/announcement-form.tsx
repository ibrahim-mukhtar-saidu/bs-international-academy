"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "./actions/create-announcement";

type AcademicSession = {
  id: string;
  name: string;
};

type AnnouncementFormProps = {
  sessions: AcademicSession[];
};

export default function AnnouncementForm({
  sessions,
}: AnnouncementFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<
    "LOW" | "NORMAL" | "HIGH" | "URGENT"
  >("NORMAL");
  const [audience, setAudience] = useState<
    "ALL" | "ADMIN" | "PRINCIPAL" | "TEACHER" | "STUDENT" | "PARENT"
  >("ALL");
  const [sessionId, setSessionId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const result = await createAnnouncement({
        title,
        content,
        priority,
        audience,
        sessionId: sessionId || undefined,
        expiresAt: expiresAt || undefined,
        publishNow,
      });

      setTitle("");
      setContent("");
      setPriority("NORMAL");
      setAudience("ALL");
      setExpiresAt("");
      setPublishNow(true);

      setMessage(
        result.status === "PUBLISHED"
          ? "Announcement published successfully."
          : "Announcement saved as draft.",
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create announcement.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
          Create announcement
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
          Publish an important update
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Share school notices, reminders, events, and important information.
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        <label className="text-sm font-semibold text-slate-700">
          Title

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={160}
            placeholder="e.g. Resumption date for second term"
            className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Message

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
            rows={6}
            maxLength={5000}
            placeholder="Write the announcement message..."
            className="mt-2 block w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal leading-6 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />

          <span className="mt-1 block text-right text-xs font-normal text-slate-400">
            {content.length}/5000
          </span>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Priority

            <select
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as
                    | "LOW"
                    | "NORMAL"
                    | "HIGH"
                    | "URGENT",
                )
              }
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Audience

            <select
              value={audience}
              onChange={(event) =>
                setAudience(
                  event.target.value as
                    | "ALL"
                    | "ADMIN"
                    | "PRINCIPAL"
                    | "TEACHER"
                    | "STUDENT"
                    | "PARENT",
                )
              }
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              <option value="ALL">Everyone</option>
              <option value="ADMIN">Administrators</option>
              <option value="PRINCIPAL">Principals</option>
              <option value="TEACHER">Teachers</option>
              <option value="STUDENT">Students</option>
              <option value="PARENT">Parents</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Academic session

            <select
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              <option value="">All sessions</option>

              {sessions.map((academicSession) => (
                <option
                  key={academicSession.id}
                  value={academicSession.id}
                >
                  {academicSession.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Expiry date

            <input
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={publishNow}
            onChange={(event) => setPublishNow(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />

          <span>
            <span className="block text-sm font-semibold text-slate-800">
              Publish immediately
            </span>

            <span className="mt-0.5 block text-xs font-normal leading-5 text-slate-500">
              Turn this off to save the announcement as a draft.
            </span>
          </span>
        </label>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : publishNow
              ? "Publish Announcement"
              : "Save Draft"}
        </button>
      </div>
    </form>
  );
}
