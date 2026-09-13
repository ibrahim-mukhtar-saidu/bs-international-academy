"use client";

import { FormEvent, useState } from "react";
import { createStudent } from "./actions/create-student";

interface SessionOption {
  id: string;
  name: string;
}

interface ClassOption {
  id: string;
  name: string;
  code: string;
  sessionId: string;
}

interface StudentFormProps {
  sessions: SessionOption[];
  classes: ClassOption[];
}

export default function StudentForm({
  sessions,
  classes,
}: StudentFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [classId, setClassId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const availableClasses = classes.filter(
    (schoolClass) =>
      !sessionId || schoolClass.sessionId === sessionId,
  );

  function handleSessionChange(value: string) {
    setSessionId(value);
    setClassId("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }

    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!admissionNo.trim()) {
      setError("Admission number is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!sessionId) {
      setError("Academic session is required");
      return;
    }

    if (!classId) {
      setError("Class is required");
      return;
    }

    try {
      setIsSubmitting(true);

      await createStudent({
        firstName,
        lastName,
        email,
        password,
        admissionNo,
        dateOfBirth,
        gender,
        address,
        classId,
        sessionId,
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setAdmissionNo("");
      setDateOfBirth("");
      setGender("");
      setAddress("");
      setSessionId("");
      setClassId("");

      setSuccess("Student created successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create student",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="student-first-name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            First Name
          </label>

          <input
            id="student-first-name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="e.g. Ibrahim"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="student-last-name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>

          <input
            id="student-last-name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="e.g. Musa"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="student-email"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Email
        </label>

        <input
          id="student-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="student@example.com"
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="student-password"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Initial Password
        </label>

        <input
          id="student-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimum 8 characters"
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <p className="mt-1 text-xs text-gray-500">
          The password will be securely hashed before storage.
        </p>
      </div>

      <div>
        <label
          htmlFor="student-admission-no"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Admission Number
        </label>

        <input
          id="student-admission-no"
          type="text"
          value={admissionNo}
          onChange={(event) =>
            setAdmissionNo(event.target.value.toUpperCase())
          }
          placeholder="e.g. BSIA001"
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <p className="mt-1 text-xs text-gray-500">
          Must be unique within the school.
        </p>
      </div>

      <div>
        <label
          htmlFor="student-dob"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Date of Birth
          <span className="ml-1 font-normal text-gray-400">(optional)</span>
        </label>

        <input
          id="student-dob"
          type="date"
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(event.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="student-gender"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Gender
          <span className="ml-1 font-normal text-gray-400">(optional)</span>
        </label>

        <select
          id="student-gender"
          value={gender}
          onChange={(event) => setGender(event.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="student-address"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Address
          <span className="ml-1 font-normal text-gray-400">(optional)</span>
        </label>

        <textarea
          id="student-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Student residential address"
          rows={3}
          disabled={isSubmitting}
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="student-session"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Academic Session
        </label>

        <select
          id="student-session"
          value={sessionId}
          onChange={(event) => handleSessionChange(event.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Select academic session</option>

          {sessions.map((academicSession) => (
            <option key={academicSession.id} value={academicSession.id}>
              {academicSession.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="student-class"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Class
        </label>

        <select
          id="student-class"
          value={classId}
          onChange={(event) => setClassId(event.target.value)}
          disabled={isSubmitting || !sessionId}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
        >
          <option value="">
            {sessionId ? "Select class" : "Select session first"}
          </option>

          {availableClasses.map((schoolClass) => (
            <option key={schoolClass.id} value={schoolClass.id}>
              {schoolClass.name} ({schoolClass.code})
            </option>
          ))}
        </select>
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
        {isSubmitting ? "Creating..." : "Create Student"}
      </button>
    </form>
  );
}
