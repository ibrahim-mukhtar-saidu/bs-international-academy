"use client";

import { useState } from "react";
import { updateAdmissionStatus } from "./actions/update-admission-status";

type AdmissionStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

type AdmissionStatusControlProps = {
  applicationId: string;
  currentStatus: AdmissionStatus;
};

export default function AdmissionStatusControl({
  applicationId,
  currentStatus,
}: AdmissionStatusControlProps) {
  const [status, setStatus] = useState<AdmissionStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const nextStatus = event.target.value as AdmissionStatus;

    if (nextStatus === status) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const result = await updateAdmissionStatus(
        applicationId,
        nextStatus,
      );

      setStatus(result.status as AdmissionStatus);
      setMessage("Saved");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update status.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-w-[180px] flex-col gap-1.5">
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="PENDING">Pending</option>
        <option value="UNDER_REVIEW">Under Review</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="WITHDRAWN">Withdrawn</option>
      </select>

      {saving ? (
        <span className="text-xs text-slate-400">
          Saving...
        </span>
      ) : message ? (
        <span className="text-xs text-emerald-600">
          {message}
        </span>
      ) : null}
    </div>
  );
}
