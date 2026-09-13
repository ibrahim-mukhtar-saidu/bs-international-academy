import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ExaminationForm from "./examination-form";

export default async function ExaminationsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        You do not have permission to access examinations.
      </div>
    );
  }

  const [sessions, terms, classes, examinations] = await Promise.all([
    prisma.academicSession.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        startYear: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.term.findMany({
      where: {
        session: {
          schoolId: session.user.schoolId,
        },
      },
      orderBy: [
        {
          session: {
            startYear: "desc",
          },
        },
        {
          number: "asc",
        },
      ],
      select: {
        id: true,
        name: true,
        sessionId: true,
      },
    }),

    prisma.schoolClass.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        sessionId: true,
      },
    }),

    prisma.examination.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        maxScore: true,
        sessionId: true,
        termId: true,
        classId: true,
        term: {
          select: {
            name: true,
          },
        },
        schoolClass: {
          select: {
            name: true,
          },
        },
        session: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Examinations
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Create and manage examinations for your school.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Create Examination
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Create an examination for a specific academic session, term, and
          class.
        </p>

        <div className="mt-6">
          <ExaminationForm
            sessions={sessions}
            terms={terms}
            classes={classes}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Existing Examinations
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {examinations.length} examination
            {examinations.length === 1 ? "" : "s"} created.
          </p>
        </div>

        {examinations.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">
            No examinations have been created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Examination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Max Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {examinations.map((examination) => (
                  <tr key={examination.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {examination.name}
                      </div>
                      {examination.description && (
                        <div className="mt-1 text-sm text-slate-500">
                          {examination.description}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {examination.session.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {examination.term.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {examination.schoolClass.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {examination.maxScore.toString()}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-4">
                        <a
                          href={`/dashboard/examinations/${examination.id}`}
                          className="font-medium text-green-600 hover:text-green-800"
                        >
                          Scores
                        </a>

                        <a
                          href={`/dashboard/examinations/${examination.id}/edit`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </a>
                      </div>
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
