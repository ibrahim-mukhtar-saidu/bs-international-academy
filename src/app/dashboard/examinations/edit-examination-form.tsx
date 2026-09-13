"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateExamination } from "./actions/update-examination";

interface EditExaminationFormProps {
  examination: {
    id: string;
    name: string;
    description: string | null;
    maxScore: string;
  };
}

export default function EditExaminationForm({
  examination,
}: EditExaminationFormProps) {
  const router = useRouter();

  const [name, setName] = useState(examination.name);
  const [description, setDescription] = useState(
    examination.description ?? "",
  );
  const [maxScore, setMaxScore] = useState(examination.maxScore);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await updateExamination({
        examinationId: examination.id,
        name,
        description,
        maxScore,
      });

      setMessage("Examination updated successfully.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update examination.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Edit Examination
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Update the examination name, maximum score, or description.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Examination Name
          </label>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Maximum Score
          </label>
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={maxScore}
            onChange={(event) => setMaxScore(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      {message && (
        <div className="rounded-lg border bg-gray-50 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
