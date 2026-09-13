import { prisma } from "@/lib/prisma";
import ClassForm from "./class-form";

const sectionTypeLabels = {
  NURSERY: "Nursery",
  PRIMARY: "Primary",
  JUNIOR_SECONDARY: "Junior Secondary",
  SENIOR_SECONDARY: "Senior Secondary",
} as const;

export default async function ClassesPage() {
  const [sessions, sections, classes] = await Promise.all([
    prisma.academicSession.findMany({
      orderBy: {
        startYear: "desc",
      },
      select: {
        id: true,
        name: true,
        isCurrent: true,
      },
    }),

    prisma.section.findMany({
      orderBy: {
        type: "asc",
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    }),

    prisma.schoolClass.findMany({
      orderBy: [
        {
          session: {
            startYear: "desc",
          },
        },
        {
          name: "asc",
        },
      ],
      include: {
        session: {
          select: {
            name: true,
          },
        },
        section: {
          select: {
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            studentProfiles: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Academic Management
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          School Classes
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Create and manage classes for each academic session and school
          section.
        </p>
      </div>

      <div className="mt-8">
        <ClassForm
          sessions={sessions}
          sections={sections.map((section) => ({
            id: section.id,
            name: section.name,
            type: section.type,
          }))}
        />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {classes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500">
              C
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No classes configured
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create your first class to begin organizing students.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Class
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Section
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Session
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Capacity
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Students
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {classes.map((schoolClass) => (
                  <tr key={schoolClass.id}>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {schoolClass.name}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {schoolClass.code}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-800">
                        {schoolClass.section.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {sectionTypeLabels[schoolClass.section.type]}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {schoolClass.session.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {schoolClass.capacity ?? "Not set"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {schoolClass._count.studentProfiles}
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
