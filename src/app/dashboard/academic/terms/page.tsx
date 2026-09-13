import { prisma } from "@/lib/prisma";
import TermForm from "./term-form";

export default async function TermsPage() {
  const sessions = await prisma.academicSession.findMany({
    orderBy: {
      startYear: "desc",
    },
    include: {
      terms: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  const sessionOptions = sessions.map((session) => ({
    id: session.id,
    name: session.name,
    isCurrent: session.isCurrent,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Academic Management
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Academic Terms
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Manage First, Second, and Third Term for each academic session.
        </p>
      </div>

      <div className="mt-8">
        <TermForm sessions={sessionOptions} />
      </div>

      <div className="mt-8 space-y-6">
        {sessions.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500">
              T
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No academic sessions found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create an academic session before adding academic terms.
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <section
              key={session.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
            >
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {session.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {session.startYear} — {session.endYear}
                    </p>
                  </div>

                  {session.isCurrent ? (
                    <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Current Session
                    </span>
                  ) : (
                    <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Inactive Session
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {session.terms.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No terms configured
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      This session does not have any academic terms yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Term
                          </th>

                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Number
                          </th>

                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {session.terms.map((term) => (
                          <tr key={term.id}>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                              {term.name}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                              {term.number}
                            </td>

                            <td className="px-4 py-4">
                              {term.isCurrent ? (
                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  Current
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  Inactive
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
