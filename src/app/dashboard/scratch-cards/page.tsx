import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ScratchCardGenerator from "./scratch-card-generator";

export default async function ScratchCardsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          You do not have permission to access scratch card management.
        </div>
      </div>
    );
  }

  const cards = await prisma.scratchCard.findMany({
    where: {
      schoolId: session.user.schoolId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      serial: true,
      status: true,
      expiresAt: true,
      usedAt: true,
      createdAt: true,
      student: {
        select: {
          admissionNo: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  const activeCount = cards.filter(
    (card) => card.status === "ACTIVE",
  ).length;

  const usedCount = cards.filter(
    (card) => card.status === "USED",
  ).length;

  const disabledCount = cards.filter(
    (card) => card.status === "DISABLED",
  ).length;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div className="relative px-6 py-8 sm:px-8 lg:px-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Result Access
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Scratch Card Management
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Generate and manage secure result-access cards for students.
              Scratch card PINs are securely hashed and are never stored in
              plain text.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Cards"
          value={cards.length}
          description="Cards generated"
        />

        <StatCard
          label="Active"
          value={activeCount}
          description="Available for use"
        />

        <StatCard
          label="Used"
          value={usedCount}
          description="Already redeemed"
        />

        <StatCard
          label="Disabled"
          value={disabledCount}
          description="Blocked cards"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Generate Scratch Card
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Generate a new serial number and secure six-digit PIN.
          </p>
        </div>

        <div className="mt-6">
          <ScratchCardGenerator />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Scratch Cards
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            {cards.length} card{cards.length === 1 ? "" : "s"} generated for
            this school.
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-slate-900">
              No scratch cards yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Generate the first card using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Serial
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Student
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Created
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Used
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {card.serial}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={card.status} />
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {card.student
                        ? `${card.student.user.firstName} ${card.student.user.lastName}`
                        : "Unassigned"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {card.createdAt.toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {card.usedAt
                        ? card.usedAt.toLocaleDateString()
                        : "Not used"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "ACTIVE" | "USED" | "EXPIRED" | "DISABLED";
}) {
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    USED: "bg-blue-50 text-blue-700",
    EXPIRED: "bg-amber-50 text-amber-700",
    DISABLED: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
