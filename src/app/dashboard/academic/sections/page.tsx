import { prisma } from "@/lib/prisma";
import SectionForm from "./section-form";

const sectionDescriptions = {
  NURSERY: "Early childhood education",
  PRIMARY: "Primary school education",
  JUNIOR_SECONDARY: "JSS education",
  SENIOR_SECONDARY: "SSS education",
} as const;

export default async function SectionsPage() {
  const sections = await prisma.section.findMany({
    orderBy: {
      type: "asc",
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Academic Management
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          School Sections
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Manage Nursery, Primary, Junior Secondary, and Senior Secondary
          sections for BS INTERNATIONAL ACADEMY.
        </p>
      </div>

      <div className="mt-8">
        <SectionForm />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {sections.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500">
              S
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No sections configured
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create the school&apos;s educational sections to begin organizing
              classes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Section
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {sections.map((section) => (
                  <tr key={section.id}>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {section.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {section.type}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sectionDescriptions[section.type]}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
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
