
"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAssessmentScore } from "../actions/save-assessment-score";

interface ScoreFormProps {
  assessmentId: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  maxScore: string;
  existingScore: string;
  existingFeedback: string;
}

export default function ScoreForm({
  assessmentId,
  studentId,
  studentName,
  admissionNo,
  maxScore,
  existingScore,
  existingFeedback,
}: ScoreFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

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
      await saveAssessmentScore({
        assessmentId,
        studentId,
        score,
        feedback,
      });

      setSuccess("Saved");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save score",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="grid gap-4 md:grid-cols-[1fr_140px_1fr_auto] md:items-end">
        <div>
          <p className="font-medium text-slate-900">
            {studentName}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Admission No: {admissionNo}
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
