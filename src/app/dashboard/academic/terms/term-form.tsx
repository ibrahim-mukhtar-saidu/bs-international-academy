"use client";

import { FormEvent, useState, useTransition } from "react";
import { createAcademicTerm } from "./actions/create-term";

interface AcademicSessionOption {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface TermFormProps {
  sessions: AcademicSessionOption[];
}

const termOptions = [
  { number: 1, name: "First Term" },
  { number: 2, name: "Second Term" },
  { number: 3, name: "Third Term" },
];

export default function TermForm({ sessions }: TermFormProps) {
  const [sessionId, setSessionId] = useState(
    sessions.find((session) => session.isCurrent)?.id ?? sessions[0]?.id ?? "",
  );
  const [number, setNumber] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
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

    if (!number) {
      setError("Please select a term.");
      return;
    }

    const parsedNumber = Number(number);
    const selectedTerm = termOptions.find(
      (term) => term.number === parsedNumber,
    );

    if (!selectedTerm) {
      setError("Please select a valid term.");
      return;
    }

    startTransition(async () => {
      try {
        await createAcademicTerm({
          sessionId,
          name: selectedTerm.name,
          number: parsedNumber,
          isCurrent,
        });

        setNumber("");
        setIsCurrent(false);
        setSuccess("Academic term created successfully.");

        window.location.reload();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to create academic term.",
        );
      }
    });
  }

  if (sessions.length === 0) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Add Academic Term
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add a term to an existing academic session.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="term-session"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Academic session
          </label>

          <select
            id="term-session"
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
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
            htmlFor="term-number"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Term
          </label>

          <select
            id="term-number"
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="">Select term</option>

            {termOptions.map((term) => (
              <option key={term.number} value={term.number}>
                {term.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(event) => setIsCurrent(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
        />

        <span>
          <span className="block text-sm font-medium text-slate-800">
            Set as current term
          </span>

          <span className="block text-xs text-slate-500">
            Any existing current term in this session will automatically
            become inactive.
          </span>
        </span>
      </label>

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
          {isPending ? "Creating..." : "Create Academic Term"}
        </button>
      </div>
    </form>
  );
}
