
"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentType } from "@/generated/prisma/client";
import { createAssessment } from "./actions/create-assessment";

interface SessionOption {
  id: string;
  name: string;
}

interface TermOption {
  id: string;
  name: string;
  number: number;
  sessionId: string;
}

interface ClassOption {
  id: string;
  name: string;
  code: string;
  sessionId: string;
}

interface AssignmentOption {
  id: string;
  sessionId: string;
  classId: string;
  teacherId: string;
  teacherName: string;
  subjectName: string;
  subjectCode: string;
}

interface AssessmentFormProps {
  sessions: SessionOption[];
  terms: TermOption[];
  classes: ClassOption[];
  assignments: AssignmentOption[];
  fixedType?: AssessmentType;
}

export default function AssessmentForm({
  sessions,
  terms,
  classes,
  assignments,
  fixedType,
}: AssessmentFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [classId, setClassId] = useState("");
  const [termId, setTermId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredClasses = useMemo(
    () => classes.filter((schoolClass) => schoolClass.sessionId === sessionId),
    [classes, sessionId],
  );

  const filteredTerms = useMemo(
    () => terms.filter((term) => term.sessionId === sessionId),
    [terms, sessionId],
  );

  const filteredAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.sessionId === sessionId &&
          assignment.classId === classId,
      ),
    [assignments, sessionId, classId],
  );

  function handleSessionChange(value: string) {
    setSessionId(value);
    setClassId("");
    setTermId("");
  }

  function handleClassChange(value: string) {
    setClassId(value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    const type = fixedType ??
      (String(formData.get("type") ?? "") as AssessmentType);
    const maxScore = Number(formData.get("maxScore"));
    const dueDate = String(formData.get("dueDate") ?? "");
    const assignmentId = String(formData.get("assignmentId") ?? "");

    try {
      if (!assignmentId) {
        throw new Error("Please select a teacher and subject");
      }

      await createAssessment({
        title,
        description,
        type,
        maxScore,
        dueDate,
        sessionId,
        termId: termId || undefined,
        classId,
        teacherAssignmentId: assignmentId,
      });

      formRef.current?.reset();
      setClassId("");
      setTermId("");
      setSuccess("Assessment created successfully.");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create assessment",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        {!fixedType && (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Assessment Type
            </span>
            <select
              name="type"
              defaultValue="ASSIGNMENT"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            >
              <option value="ASSIGNMENT">Assignment</option>
              <option value="TEST">Test</option>
            </select>
          </label>
        )}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Title
          </span>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. Mathematics Assignment 1"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            Description
          </span>
          <textarea
            name="description"
            rows={3}
            placeholder="Assessment instructions or description"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Academic Session
          </span>
          <select
            value={sessionId}
            onChange={(event) => handleSessionChange(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          >
            {sessions.map((academicSession) => (
              <option key={academicSession.id} value={academicSession.id}>
                {academicSession.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Term
          </span>
          <select
            value={termId}
            onChange={(event) => setTermId(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          >
            <option value="">Select term</option>
            {filteredTerms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Class
          </span>
          <select
            value={classId}
            onChange={(event) => handleClassChange(event.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          >
            <option value="">Select class</option>
            {filteredClasses.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name} ({schoolClass.code})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Teacher & Subject
          </span>
          <select
            name="assignmentId"
            required
            disabled={!classId}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm disabled:bg-slate-100"
          >
            <option value="">
              {classId ? "Select teacher & subject" : "Select a class first"}
            </option>
            {filteredAssignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.subjectName} ({assignment.subjectCode}) —{" "}
                {assignment.teacherName}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Maximum Score
          </span>
          <input
            name="maxScore"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue="10"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Due Date
          </span>
          <input
            name="dueDate"
            type="datetime-local"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Creating..." : "Create Assessment"}
      </button>
    </form>
  );
}
