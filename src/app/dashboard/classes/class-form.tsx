"use client";

import { FormEvent, useState, useTransition } from "react";
import { createSchoolClass } from "./actions/create-class";

interface SessionOption {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface SectionOption {
  id: string;
  name: string;
  type: string;
}

interface ClassFormProps {
  sessions: SessionOption[];
  sections: SectionOption[];
}

export default function ClassForm({
  sessions,
  sections,
}: ClassFormProps) {
  const [sessionId, setSessionId] = useState(
    sessions.find((session) => session.isCurrent)?.id ??
      sessions[0]?.id ??
      "",
  );

  const [sectionId, setSectionId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [capacity, setCapacity] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!sessionId) {
      setError("Please select an academic session.");
      return;
    }

    if (!sectionId) {
      setError("Please select a school section.");
      return;
    }

    if (!name.trim()) {
      setError("Class name is required.");
      return;
    }

    if (!code.trim()) {
      setError("Class code is required.");
      return;
    }

    let parsedCapacity: number | undefined;

    if (capacity.trim()) {
      parsedCapacity = Number(capacity);

      if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
        setError("Capacity must be a positive whole number.");
        return;
      }
    }

    startTransition(async () => {
      try {
        await createSchoolClass({
          name,
          code,
          capacity: parsedCapacity,
          sectionId,
          sessionId,
        });

        setName("");
        setCode("");
        setCapacity("");
        setSectionId("");
        setSuccess("Class created successfully.");

        window.location.reload();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to create class.",
        );
      }
    });
  }

  if (sessions.length === 0 || sections.length === 0) {
    return (
      <div className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
        <h2 className="text-lg font-semibold text-amber-900">
          Academic structure required
        </h2>

        <p className="mt-2 text-sm text-amber-800">
          You need at least one academic session and one school section before
          creating a class.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Add School Class
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a class and connect it to an academic session and school
          section.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="class-session"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Academic session
          </label>

          <select
            id="class-session"
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="">Select session</option>

            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
                {session.isCurrent ? " (Current)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="class-section"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            School section
          </label>

          <select
            id="class-section"
            value={sectionId}
            onChange={(event) => setSectionId(event.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="">Select section</option>

            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="class-name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Class name
          </label>

          <input
            id="class-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Primary 1"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="class-code"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Class code
          </label>

          <input
            id="class-code"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="PRI1"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 uppercase text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="class-capacity"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Capacity
            <span className="ml-1 text-xs font-normal text-slate-500">
              (optional)
            </span>
          </label>

          <input
            id="class-capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            placeholder="30"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          role="status"
          className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {success}
        </div>
      ) : null}

      <div className="mt-6">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating..." : "Create Class"}
        </button>
      </div>
    </form>
  );
}
