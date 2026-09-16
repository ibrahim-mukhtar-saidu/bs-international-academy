"use client";

import { useState, useTransition } from "react";
import { createScratchCard } from "./actions/create-scratch-card";

type GeneratedCard = {
  id: string;
  serial: string;
  pin: string;
  status: string;
};

export default function ScratchCardGenerator() {
  const [isPending, startTransition] = useTransition();
  const [card, setCard] = useState<GeneratedCard | null>(null);
  const [error, setError] = useState("");

  function handleGenerate() {
    setError("");
    setCard(null);

    startTransition(async () => {
      try {
        const generated = await createScratchCard();
        setCard(generated);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to generate scratch card.",
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Generating..." : "Generate Scratch Card"}
      </button>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {card && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Card Generated
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Keep these credentials secure
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                The PIN is shown here because it cannot be recovered from the
                database later.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {card.status}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <CredentialBox label="Serial Number" value={card.serial} />
            <CredentialBox label="Scratch PIN" value={card.pin} />
          </div>

          <div className="mt-4 rounded-xl border border-emerald-200 bg-white/70 p-4 text-xs text-slate-600">
            <strong>Security:</strong> The PIN is stored as a secure hash and
            will not be displayed again after this page is refreshed.
          </div>
        </div>
      )}
    </div>
  );
}

function CredentialBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-all font-mono text-lg font-bold tracking-wide text-slate-900">
        {value}
      </p>
    </div>
  );
}
