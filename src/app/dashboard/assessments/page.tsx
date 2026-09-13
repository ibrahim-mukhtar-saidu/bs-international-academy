import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AssessmentForm from "./assessment-form";

export default async function AssessmentsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL" &&
    session.user.role !== "TEACHER"
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        You do not have permission to access assessments.
      </div>
    );
  }

  const [sessions, terms, classes, assignments, assessments] =
    await Promise.all([
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
          number: true,
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
          code: true,
          sessionId: true,
        },
      }),

      prisma.teacherAssignment.findMany({
        where: {
          teacher: {
            schoolId: session.user.schoolId,
          },
          ...(session.user.role === "TEACHER"
            ? {
                teacher: {
                  userId: session.user.id,
                  schoolId: session.user.schoolId,
                },
              }
            : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          sessionId: true,
          classId: true,
          teacherId: true,
          teacher: {
            select: {
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
        },
      }),

      prisma.assessment.findMany({
        where: {
          session: {
            schoolId: session.user.schoolId,
          },
          ...(session.user.role === "TEACHER"
            ? {
                teacherAssignment: {
                  teacher: {
                    userId: session.user.id,
                    schoolId: session.user.schoolId,
                  },
                },
              }
            : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          maxScore: true,
          dueDate: true,
          isPublished: true,
          sessionId: true,
          termId: true,
          classId: true,
          teacherAssignmentId: true,
          schoolClass: {
            select: {
              name: true,
              code: true,
            },
          },
          term: {
            select: {
              name: true,
            },
          },
          teacherAssignment: {
            select: {
              subject: {
                select: {
                  name: true,
                  code: true,
                },
              },
              teacher: {
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Assignments & Tests
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Create and manage assignments and tests for assigned classes and
          subjects.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Create Assessment
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Create an assignment or test linked to a teacher, subject, class,
          session, and term.
        </p>

        <div className="mt-6">
          <AssessmentForm
            sessions={sessions}
            terms={terms}
            classes={classes}
            assignments={assignments.map((assignment) => ({
              id: assignment.id,
              sessionId: assignment.sessionId,
              classId: assignment.classId,
              teacherId: assignment.teacherId,
              teacherName: `${assignment.teacher.user.firstName} ${assignment.teacher.user.lastName}`,
              subjectName: assignment.subject.name,
              subjectCode: assignment.subject.code,
            }))}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Existing Assessments
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {assessments.length} assessment
            {assessments.length === 1 ? "" : "s"} created.
          </p>
        </div>

        {assessments.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">
            No assignments or tests have been created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Max Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {assessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/assessments/${assessment.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {assessment.title}
                      </Link>
                      {assessment.description && (
                        <div className="mt-1 max-w-xs text-xs text-slate-500">
                          {assessment.description}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {assessment.type}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {assessment.teacherAssignment.subject.name} (
                      {assessment.teacherAssignment.subject.code})
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {assessment.schoolClass.name} (
                      {assessment.schoolClass.code})
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {assessment.term?.name ?? "Not specified"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {assessment.maxScore.toString()}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span
                        className={
                          assessment.isPublished
                            ? "font-medium text-green-700"
                            : "font-medium text-amber-700"
                        }
                      >
                        {assessment.isPublished ? "Published" : "Draft"}
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
