"use client";

import { FormEvent, useMemo, useState } from "react";
import { createAdmission } from "./actions/create-admission";

type AcademicSession = {
  id: string;
  name: string;
  isCurrent: boolean;
};

type Section = {
  id: string;
  name: string;
  type: string;
};

type SchoolClass = {
  id: string;
  name: string;
  code: string;
  sectionId: string;
  sessionId: string;
};

type AdmissionFormProps = {
  academicSessions: AcademicSession[];
  sections: Section[];
  classes: SchoolClass[];
};

export default function AdmissionForm({
  academicSessions,
  sections,
  classes,
}: AdmissionFormProps) {
  const currentSession =
    academicSessions.find((item) => item.isCurrent)?.id ??
    academicSessions[0]?.id ??
    "";

  const [sessionId, setSessionId] = useState(currentSession);
  const [sectionId, setSectionId] = useState("");
  const [classId, setClassId] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const filteredClasses = useMemo(
    () =>
      classes.filter(
        (schoolClass) =>
          schoolClass.sessionId === sessionId &&
          (!sectionId || schoolClass.sectionId === sectionId),
      ),
    [classes, sectionId, sessionId],
  );

  function handleSessionChange(value: string) {
    setSessionId(value);
    setSectionId("");
    setClassId("");
  }

  function handleSectionChange(value: string) {
    setSectionId(value);
    setClassId("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const result = await createAdmission({
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        guardianName,
        guardianPhone,
        guardianEmail,
        relationship,
        notes,
        sessionId,
        sectionId,
        classId,
      });

      setSuccess(
        `Application ${result.reference} created successfully.`,
      );

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDateOfBirth("");
      setGender("");
      setAddress("");
      setGuardianName("");
      setGuardianPhone("");
      setGuardianEmail("");
      setRelationship("");
      setNotes("");
      setSectionId("");
      setClassId("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create admission application.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
          New application
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Admission Application
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Capture applicant and guardian information before the application
          moves through the admission review process.
        </p>
      </div>

      {success ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-base font-bold text-slate-950">
            Academic placement
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              Academic session
              <select
                value={sessionId}
                onChange={(event) => handleSessionChange(event.target.value)}
                required
                className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Select session</option>

                {academicSessions.map((academicSession) => (
                  <option
                    key={academicSession.id}
                    value={academicSession.id}
                  >
                    {academicSession.name}
                    {academicSession.isCurrent ? " · Current" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Section
              <select
                value={sectionId}
                onChange={(event) =>
                  handleSectionChange(event.target.value)
                }
                className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Select section</option>

                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Class
              <select
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Select class</option>

                {filteredClasses.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name} ({schoolClass.code})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-950">
            Applicant information
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              First name
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Last name
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Phone
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Date of birth
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Gender
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 md:col-span-2">
              Address
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={3}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-950">
            Parent / guardian
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Guardian name
              <input
                value={guardianName}
                onChange={(event) => setGuardianName(event.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Relationship
              <input
                value={relationship}
                onChange={(event) => setRelationship(event.target.value)}
                placeholder="e.g. Father, Mother, Guardian"
                className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Guardian phone
              <input
                value={guardianPhone}
                onChange={(event) => setGuardianPhone(event.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Guardian email
              <input
                type="email"
                value={guardianEmail}
                onChange={(event) => setGuardianEmail(event.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-950">
            Additional notes
          </h3>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Add any relevant admission notes..."
            className="mt-4 block w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-400">
            New applications are created with a Pending status and can be
            reviewed later.
          </p>

          <button
            type="submit"
            disabled={saving || !sessionId}
            className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Application"}
          </button>
        </div>
      </form>
    </section>
  );
}
