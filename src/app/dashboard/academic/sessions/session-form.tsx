"use client";

import { FormEvent, useState, useTransition } from "react";
import { createAcademicSession } from "./actions/create-session";

export default function SessionForm() {
  const [name, setName] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const parsedStartYear = Number(startYear);
    const parsedEndYear = Number(endYear);

    if (!name.trim()) {
      setError("Session name is required.");
      return;
    }

    if (!Number.isInteger(parsedStartYear) || !Number.isInteger(parsedEndYear)) {
      setError("Please enter valid start and end years.");
      return;
    }

    startTransition(async () => {
      try {
        await createAcademicSession({
          name,
          startYear: parsedStartYear,
          endYear: parsedEndYear,
          isCurrent,
        });

        setName("");
        setStartYear("");
        setEndYear("");
        setIsCurrent(false);
        setSuccess("Academic session created successfully.");

        window.location.reload();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to create academic session.",
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Add Academic Session
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a new academic session for the school.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div>
          <label
            htmlFor="session-name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Session name
          </label>

          <input
            id="session-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="2026/2027"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="start-year"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Start year
          </label>

          <input
            id="start-year"
            type="number"
            min="2000"
            max="2100"
            value={startYear}
            onChange={(event) => setStartYear(event.target.value)}
            placeholder="2026"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="end-year"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            End year
          </label>

          <input
            id="end-year"
            type="number"
            min="2001"
            max="2101"
            value={endYear}
            onChange={(event) => setEndYear(event.target.value)}
            placeholder="2027"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
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
            Set as current session
          </span>

          <span className="block text-xs text-slate-500">
            Any existing current session will automatically become inactive.
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
          {isPending ? "Creating..." : "Create Academic Session"}
        </button>
      </div>
    </form>
  );
}
