"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createTeacherAssignment } from "./actions/create-assignment";

interface Teacher {
  id: string;
  name: string;
  employeeNo: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface SchoolClass {
  id: string;
  name: string;
  code: string;
  sessionId: string;
}

interface AcademicSession {
  id: string;
  name: string;
}

interface AssignmentFormProps {
  teachers: Teacher[];
  subjects: Subject[];
  classes: SchoolClass[];
  sessions: AcademicSession[];
}

export default function AssignmentForm({
  teachers,
  subjects,
  classes,
  sessions,
}: AssignmentFormProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await createTeacherAssignment({
        teacherId: String(formData.get("teacherId") ?? ""),
        subjectId: String(formData.get("subjectId") ?? ""),
        classId: String(formData.get("classId") ?? ""),
        sessionId: String(formData.get("sessionId") ?? ""),
      });

      setSuccess("Teacher assignment created successfully.");

      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create teacher assignment",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Assign Teacher</h2>

        <p className="mt-1 text-sm text-gray-500">
          Connect a teacher to a subject, class, and academic session.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="teacherId"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Teacher
            </label>

            <select
              id="teacherId"
              name="teacherId"
              required
              defaultValue=""
              disabled={teachers.length === 0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select teacher</option>

              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} — {teacher.employeeNo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="subjectId"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Subject
            </label>

            <select
              id="subjectId"
              name="subjectId"
              required
              defaultValue=""
              disabled={subjects.length === 0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select subject</option>

              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} — {subject.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sessionId"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Academic Session
            </label>

            <select
              id="sessionId"
              name="sessionId"
              required
              defaultValue=""
              disabled={sessions.length === 0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select session</option>

              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="classId"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Class
            </label>

            <select
              id="classId"
              name="classId"
              required
              defaultValue=""
              disabled={classes.length === 0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select class</option>

              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name} — {schoolClass.code}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
              The server verifies that the class belongs to the selected
              academic session.
            </p>
          </div>
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
          disabled={
            isSubmitting ||
            teachers.length === 0 ||
            subjects.length === 0 ||
            classes.length === 0 ||
            sessions.length === 0
          }
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Assigning..." : "Assign Teacher"}
        </button>
      </form>
    </section>
  );
}
