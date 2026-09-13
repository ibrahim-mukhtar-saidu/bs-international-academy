"use client";

import { FormEvent, useState } from "react";
import { createSubject } from "./actions/create-subject";

export default function SubjectForm() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Subject name is required");
      return;
    }

    if (!code.trim()) {
      setError("Subject code is required");
      return;
    }

    try {
      setIsSubmitting(true);

      await createSubject({
        name,
        code,
        description,
      });

      setName("");
      setCode("");
      setDescription("");
      setSuccess("Subject created successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create subject",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="subject-name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Subject Name
        </label>

        <input
          id="subject-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Mathematics"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="subject-code"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Subject Code
        </label>

        <input
          id="subject-code"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="e.g. MATH"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          disabled={isSubmitting}
        />

        <p className="mt-1 text-xs text-gray-500">
          The code must be unique within the school.
        </p>
      </div>

      <div>
        <label
          htmlFor="subject-description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Description
          <span className="ml-1 font-normal text-gray-400">(optional)</span>
        </label>

        <textarea
          id="subject-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Brief description of the subject"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create Subject"}
      </button>
    </form>
  );
}
