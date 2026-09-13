import { prisma } from "@/lib/prisma";
import SessionForm from "./session-form";

export default async function AcademicSessionsPage() {
  const sessions = await prisma.academicSession.findMany({
    orderBy: {
      startYear: "desc",
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Academic Management
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Academic Sessions
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Manage academic sessions for BS INTERNATIONAL ACADEMY.
        </p>
      </div>

      <div className="mt-8">
        <SessionForm />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {sessions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500">
              A
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No academic sessions yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create your first academic session to begin configuring the
              school&apos;s academic structure.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Session
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Start Year
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    End Year
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {session.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {session.startYear}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {session.endYear}
                    </td>

                    <td className="px-6 py-4">
                      {session.isCurrent ? (
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
    </div>
  );
}
