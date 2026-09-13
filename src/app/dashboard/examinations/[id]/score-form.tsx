"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveExaminationScore } from "../actions/save-examination-score";

interface ScoreFormProps {
  examinationId: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  maxScore: string;
  existingScore: string;
  existingFeedback: string;
}

export default function ScoreForm({
  examinationId,
  studentId,
  studentName,
  admissionNo,
  subjectId,
  subjectName,
  subjectCode,
  maxScore,
  existingScore,
  existingFeedback,
}: ScoreFormProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);

    const score = Number(formData.get("score"));
    const feedback = String(formData.get("feedback") ?? "");

    try {
      await saveExaminationScore({
        examinationId,
        studentId,
        subjectId,
        score,
        feedback,
      });

      setSuccess("Saved");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save examination score",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_140px_1fr_auto] md:items-end">
        <div>
          <p className="font-medium text-slate-900">
            {studentName}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Admission No: {admissionNo}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-600">
            Subject
          </p>
          <p className="mt-1 font-medium text-slate-900">
            {subjectName}
          </p>
          <p className="text-xs text-slate-500">
            {subjectCode}
          </p>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-slate-600">
            Score / {maxScore}
          </span>
          <input
            name="score"
            type="number"
            min="0"
            max={maxScore}
            step="0.01"
            defaultValue={existingScore}
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-600">
            Feedback
          </span>
          <input
            name="feedback"
            type="text"
            defaultValue={existingFeedback}
            placeholder="Optional feedback"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Score"}
        </button>
      </div>

      {(error || success) && (
        <div className="mt-3 text-xs">
          {error && <span className="text-red-600">{error}</span>}
          {success && <span className="text-green-600">{success}</span>}
        </div>
      )}
    </form>
  );
}
