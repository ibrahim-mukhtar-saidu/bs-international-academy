import Link from "next/link";

const sections = [
  {
    title: "Academic Sessions",
    description: "Manage school sessions such as 2026/2027.",
    href: "/dashboard/academic/sessions",
  },
  {
    title: "Terms",
    description: "Manage First, Second, and Third Term.",
    href: "/dashboard/academic/terms",
  },
  {
    title: "Sections",
    description: "Manage Nursery, Primary, JSS, and SSS.",
    href: "/dashboard/academic/sections",
  },
  {
    title: "Classes",
    description: "Create and manage classes for each academic session.",
    href: "/dashboard/classes",
  },
  {
    title: "Subjects",
    description: "Create and manage subjects offered by the school.",
    href: "/dashboard/subjects",
  },
];

export default function AcademicStructurePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Academic Management
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Academic Structure
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Configure the academic structure of BS INTERNATIONAL ACADEMY,
          including sessions, terms, sections, classes, and subjects.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
              {section.title.charAt(0)}
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900 group-hover:text-blue-700">
              {section.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {section.description}
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-700">
              Manage →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
