"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleAssessmentPublished } from "../actions/toggle-assessment-published";

interface PublishButtonProps {
  assessmentId: string;
  isPublished: boolean;
}

export default function PublishButton({
  assessmentId,
  isPublished,
}: PublishButtonProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setSaving(true);
    setError("");

    try {
      await toggleAssessmentPublished(assessmentId);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update assessment status",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving
          ? "Updating..."
          : isPublished
            ? "Unpublish"
            : "Publish"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
