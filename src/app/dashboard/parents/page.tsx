import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ParentForm from "./parent-form";

export default async function ParentsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const [parents, students] = await Promise.all([
    prisma.parentProfile.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      include: {
        user: true,
        children: {
          include: {
            student: {
              include: {
                user: true,
                schoolClass: {
                  select: {
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

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
      },
      orderBy: {
        admissionNo: "asc",
      },
    }),
  ]);

  const formStudents = students.map((student) => ({
    id: student.id,
    name: `${student.user.firstName} ${student.user.lastName}`,
    admissionNo: student.admissionNo,
    className: student.schoolClass
      ? `${student.schoolClass.name} (${student.schoolClass.code})`
      : "No class",
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parents</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage parent accounts and connect parents to their children.
        </p>
      </div>

      <ParentForm students={formStudents} />

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Registered Parents</h2>

          <p className="text-sm text-gray-500">
            {parents.length} parent{parents.length === 1 ? "" : "s"}{" "}
            registered
          </p>
        </div>

        {parents.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No parents have been registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Parent
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Phone
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Relationship
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Child
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {parents.map((parent) => (
                  <tr key={parent.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {parent.user.firstName} {parent.user.lastName}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {parent.user.email}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {parent.user.phone ?? "Not provided"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {parent.relationship ?? "Not specified"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {parent.children.length === 0 ? (
                        "No child linked"
                      ) : (
                        <div className="space-y-1">
                          {parent.children.map((relationship) => (
                            <div key={relationship.id}>
                              <div className="font-medium text-gray-900">
                                {relationship.student.user.firstName}{" "}
                                {relationship.student.user.lastName}
                              </div>

                              <div className="text-xs text-gray-500">
                                {relationship.student.admissionNo} ·{" "}
                                {relationship.student.schoolClass
                                  ? `${relationship.student.schoolClass.name} (${relationship.student.schoolClass.code})`
                                  : "No class"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        {parent.user.status}
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
