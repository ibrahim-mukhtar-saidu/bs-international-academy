import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import StudentForm from "./student-form";

export default async function StudentsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const [students, sessions, classes] = await Promise.all([
    prisma.studentProfile.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      include: {
        user: true,
        schoolClass: {
          select: {
            name: true,
            code: true,
          },
        },
        session: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.academicSession.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        startYear: "desc",
      },
    }),

    prisma.schoolClass.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      include: {
        section: {
          select: {
            name: true,
          },
        },
        session: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const formSessions = sessions.map((item) => ({
    id: item.id,
    name: item.name,
    isCurrent: item.isCurrent,
  }));

  const formClasses = classes.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    sectionName: item.section.name,
    sessionId: item.session.id,
    sessionName: item.session.name,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage student accounts, admission numbers, classes, and academic
          sessions.
        </p>
      </div>

      <StudentForm sessions={formSessions} classes={formClasses} />

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Registered Students</h2>
          <p className="text-sm text-gray-500">
            {students.length} student{students.length === 1 ? "" : "s"}{" "}
            registered
          </p>
        </div>

        {students.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No students have been registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Admission No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <a
                        href={`/dashboard/students/${student.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {student.user.firstName} {student.user.lastName}
                      </a>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {student.admissionNo}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {student.schoolClass
                        ? `${student.schoolClass.name} (${student.schoolClass.code})`
                        : "Not assigned"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {student.session?.name ?? "Not assigned"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {student.user.email}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        {student.user.status}
                      </span>
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
