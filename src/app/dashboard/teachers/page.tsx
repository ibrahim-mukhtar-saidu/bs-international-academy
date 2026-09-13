import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TeacherForm from "./teacher-form";

export default async function TeachersPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const teachers = await prisma.teacherProfile.findMany({
    where: {
      schoolId: session.user.schoolId,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage teachers and their school accounts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Add Teacher
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a teacher account and employee profile.
            </p>
          </div>

          <TeacherForm />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                School Teachers
              </h2>

              <p className="text-sm text-gray-500">
                {teachers.length} teacher
                {teachers.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {teachers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">
                No teachers have been registered yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Teacher
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Employee No.
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Email
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Phone
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {teacher.user.firstName} {teacher.user.lastName}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-700">
                        {teacher.employeeNo}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {teacher.user.email}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {teacher.user.phone || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={
                            teacher.user.status === "ACTIVE"
                              ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                              : "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                          }
                        >
                          {teacher.user.status}
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
    </div>
  );
}
