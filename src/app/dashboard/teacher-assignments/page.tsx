import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AssignmentForm from "./assignment-form";

export default async function TeacherAssignmentsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        You do not have permission to access teacher assignments.
      </div>
    );
  }

  const schoolId = session.user.schoolId;

  const [teachers, subjects, classes, sessions, assignments] =
    await Promise.all([
      prisma.teacherProfile.findMany({
        where: {
          schoolId,
          user: {
            status: "ACTIVE",
          },
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          user: {
            firstName: "asc",
          },
        },
      }),

      prisma.subject.findMany({
        where: {
          schoolId,
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      }),

      prisma.schoolClass.findMany({
        where: {
          schoolId,
        },
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
      }),

      prisma.academicSession.findMany({
        where: {
          schoolId,
        },
        orderBy: {
          startYear: "desc",
        },
      }),

      prisma.teacherAssignment.findMany({
        where: {
          teacher: {
            schoolId,
          },
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          subject: {
            select: {
              name: true,
              code: true,
            },
          },
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
    ]);

  const teacherOptions = teachers.map((teacher) => ({
    id: teacher.id,
    name: `${teacher.user.firstName} ${teacher.user.lastName}`,
    employeeNo: teacher.employeeNo,
  }));

  const subjectOptions = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    code: subject.code,
  }));

  const classOptions = classes.map((schoolClass) => ({
    id: schoolClass.id,
    name: schoolClass.name,
    code: schoolClass.code,
    sessionId: schoolClass.sessionId,
  }));

  const sessionOptions = sessions.map((academicSession) => ({
    id: academicSession.id,
    name: academicSession.name,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Teacher Assignments
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Assign teachers to subjects and classes for specific academic
          sessions.
        </p>
      </div>

      <AssignmentForm
        teachers={teacherOptions}
        subjects={subjectOptions}
        classes={classOptions}
        sessions={sessionOptions}
      />

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Current Assignments
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {assignments.length}{" "}
            {assignments.length === 1 ? "assignment" : "assignments"}{" "}
            registered
          </p>
        </div>

        {assignments.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No teacher assignments have been created yet.
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
                    Subject
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Class
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Session
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Employee No.
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {assignment.teacher.user.firstName}{" "}
                      {assignment.teacher.user.lastName}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {assignment.subject.name} (
                      {assignment.subject.code})
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {assignment.schoolClass.name} (
                      {assignment.schoolClass.code})
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {assignment.session.name}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {assignment.teacher.employeeNo}
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
