"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createTimetablePeriod } from "./actions/create-period";

export default function PeriodForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await createTimetablePeriod({
        name: String(formData.get("name") ?? ""),
        startTime: String(formData.get("startTime") ?? ""),
        endTime: String(formData.get("endTime") ?? ""),
        order: Number(formData.get("order") ?? 0),
      });

      setMessage("Timetable period created successfully.");
      formRef.current?.reset();
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create timetable period.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Add Timetable Period
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Create a teaching period that can be used in class timetables.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Period Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="Period 1"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="startTime"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Start Time
          </label>

          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="endTime"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            End Time
          </label>

          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="order"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Order
          </label>

          <input
            id="order"
            name="order"
            type="number"
            min="1"
            step="1"
            placeholder="1"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creating..." : "Create Period"}
      </button>
    </form>
  );
}
