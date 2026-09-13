"use client";

import { FormEvent, useState, useTransition } from "react";
import { createSection } from "./actions/create-section";

const sectionOptions = [
  {
    type: "NURSERY" as const,
    name: "Nursery",
    description: "Early childhood education",
  },
  {
    type: "PRIMARY" as const,
    name: "Primary",
    description: "Primary school education",
  },
  {
    type: "JUNIOR_SECONDARY" as const,
    name: "Junior Secondary",
    description: "JSS education",
  },
  {
    type: "SENIOR_SECONDARY" as const,
    name: "Senior Secondary",
    description: "SSS education",
  },
];

export default function SectionForm() {
  const [type, setType] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!type) {
      setError("Please select a section.");
      return;
    }

    const selectedSection = sectionOptions.find(
      (section) => section.type === type,
    );

    if (!selectedSection) {
      setError("Please select a valid section.");
      return;
    }

    startTransition(async () => {
      try {
        await createSection({
          type: selectedSection.type,
          name: selectedSection.name,
        });

        setType("");
        setSuccess("Section created successfully.");

        window.location.reload();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to create section.",
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
          Add School Section
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configure the educational sections offered by the school.
        </p>
      </div>

      <div className="mt-6">
        <label
          htmlFor="section-type"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Section
        </label>

        <select
          id="section-type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          required
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        >
          <option value="">Select section</option>

          {sectionOptions.map((section) => (
            <option key={section.type} value={section.type}>
              {section.name}
            </option>
          ))}
        </select>
      </div>

      {type ? (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-800">
            {
              sectionOptions.find((section) => section.type === type)
                ?.name
            }
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {
              sectionOptions.find((section) => section.type === type)
                ?.description
            }
          </p>
        </div>
      ) : null}

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
          {isPending ? "Creating..." : "Create Section"}
        </button>
      </div>
    </form>
  );
}
