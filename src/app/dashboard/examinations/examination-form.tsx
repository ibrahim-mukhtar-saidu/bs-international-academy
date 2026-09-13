"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createExamination } from "./actions/create-examination";
interface Option {
  id: string;
  name: string;
}

interface ExaminationFormProps {
  sessions: Option[];
  terms: (Option & { sessionId: string })[];
  classes: (Option & { sessionId: string })[];
}

export default function ExaminationForm({
  sessions,
  terms,
  classes,
}: ExaminationFormProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const filteredTerms = terms.filter((term) => term.sessionId === sessionId);
  const filteredClasses = classes.filter(
    (schoolClass) => schoolClass.sessionId === sessionId,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await createExamination({
        name,
        description,
        sessionId,
        termId,
        classId,
        maxScore,
      });

      setMessage("Examination created successfully.");
      router.refresh();
      setName("");
      setDescription("");
      setMaxScore("100");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to create examination.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Examination Name</label>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. First Term Examination"
            className="w-full rounded-lg
border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Maximum Score</label>
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={maxScore}
            onChange={(event) => setMaxScore(event.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Academic Session</label>
          <select required value={sessionId} onChange={(event) => {
            setSessionId(event.target.value);
            setTermId("");
            setClassId("");
          }} className="w-full rounded-lg border px-3 py-2">
            <option value="">Select session</option>
            {sessions.map((session) => <option key={session.id} value={session.id}>{session.name}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Term</label>
          <select required value={termId} onChange={(event) => setTermId(event.target.value)} disabled={!sessionId} className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100">
            <option value="">Select term</option>
            {filteredTerms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Class</label>
          <select required value={classId} onChange={(event) => setClassId(event.target.value)} disabled={!sessionId} className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100">
            <option value="">Select class</option>
            {filteredClasses.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional examination description" rows={3} className="w-full rounded-lg border px-3 py-2" />
      </div>

      {message && (
        <div className="rounded-lg border bg-gray-50 px-4 py-3 text-sm">{message}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Examination"}
      </button>
    </form>
  );
}
