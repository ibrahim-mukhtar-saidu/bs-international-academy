import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateGrade,
  calculateSubjectResult,
} from "@/lib/results/calculations";

interface ClassResultsPageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function ClassResultsPage({
  params,
}: ClassResultsPageProps) {
  const session = await auth();
  const { classId } = await params;

  if (!session?.user) {
    return null;
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: {
      id: {
        in: (
          await prisma.academicSession.findMany({
            where: {
              schoolId: session.user.schoolId,
            },
            select: {
              id: true,
            },
          })
        ).map((item) => item.id),
      },
      isCurrent: true,
    },
  });

  if (!currentSession) {
    notFound();
  }

  const currentTerm =
    (await prisma.term.findFirst({
      where: {
        sessionId: currentSession.id,
        isCurrent: true,
      },
      orderBy: {
        number: "asc",
      },
    })) ??
    (await prisma.term.findFirst({
      where: {
        sessionId: currentSession.id,
      },
      orderBy: {
        number: "asc",
      },
    }));

  if (!currentTerm) {
    notFound();
  }

  const schoolClass = await prisma.schoolClass.findFirst({
    where: {
      id: classId,
      schoolId: session.user.schoolId,
      sessionId: currentSession.id,
    },
  });

  if (!schoolClass) {
    notFound();
  }

  const students = await prisma.studentProfile.findMany({
    where: {
      schoolId: session.user.schoolId,
      classId: schoolClass.id,
      sessionId: currentSession.id,
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
      assessmentScores: {
        where: {
          assessment: {
            sessionId: currentSession.id,
            classId: schoolClass.id,
            termId: currentTerm.id,
            isPublished: true,
          },
        },
        include: {
          assessment: {
            include: {
              teacherAssignment: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      },
      examinationScores: {
        where: {
          examination: {
            sessionId: currentSession.id,
            classId: schoolClass.id,
            termId: currentTerm.id,
            isPublished: true,
          },
        },
        include: {
          examination: true,
          subject: true,
        },
      },
    },
    orderBy: {
      admissionNo: "asc",
    },
  });

  const studentResults = students.map((student) => {
    const subjectMap = new Map<
      string,
      {
        subjectId: string;
        subjectName: string;
        subjectCode: string;
        caScore: number;
        caMaxScore: number;
        examScore: number;
        examMaxScore: number;
      }
    >();

    for (const score of student.assessmentScores) {
      const subject = score.assessment.teacherAssignment.subject;
      const existing = subjectMap.get(subject.id);

      if (existing) {
        existing.caScore += Number(score.score);
        existing.caMaxScore += Number(score.assessment.maxScore);
      } else {
        subjectMap.set(subject.id, {
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          caScore: Number(score.score),
          caMaxScore: Number(score.assessment.maxScore),
          examScore: 0,
          examMaxScore: 0,
        });
      }
    }

    for (const score of student.examinationScores) {
      const existing = subjectMap.get(score.subjectId);

      if (existing) {
        existing.examScore += Number(score.score);
        existing.examMaxScore += Number(score.examination.maxScore);
      } else {
        subjectMap.set(score.subjectId, {
          subjectId: score.subjectId,
          subjectName: score.subject.name,
          subjectCode: score.subject.code,
          caScore: 0,
          caMaxScore: 0,
          examScore: Number(score.score),
          examMaxScore: Number(score.examination.maxScore),
        });
      }
    }

    const results = Array.from(subjectMap.values()).map((subject) =>
      calculateSubjectResult(subject),
    );

    const total = results.reduce(
      (sum, result) => sum + result.finalScore,
      0,
    );

    const average =
      results.length > 0 ? total / results.length : 0;

    const { grade, remark } = calculateGrade(average);

    return {
      id: student.id,
      name: `${student.user.firstName} ${student.user.lastName}`,
      admissionNo: student.admissionNo,
      subjects: results.length,
      total,
      average,
      grade,
      remark,
    };
  });

  const classAverage =
    studentResults.length > 0
      ? studentResults.reduce(
          (sum, student) => sum + student.average,
          0,
        ) / studentResults.length
      : 0;

  return (
    <main className="space-y-6">
      <div>
        <Link
          href="/dashboard/results"
          className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
        >
          ← Back to Results
        </Link>

        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Academic Performance
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {schoolClass.name} Results
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {currentSession.name} · {currentTerm.name}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Formula
            </p>
            <p className="mt-1 font-bold text-slate-950">
              40% CA + 60% Exam
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Students
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {studentResults.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Class Average
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {classAverage.toFixed(2)}%
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
            Session
          </p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {currentSession.name}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {currentTerm.name}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-6">
          <h2 className="text-xl font-bold text-slate-950">
            Student Performance
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Published assessment and examination results for this class.
          </p>
        </div>

        {studentResults.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-slate-800">
              No active students found
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Students assigned to this class will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Admission No.</th>
                  <th className="px-5 py-4">Subjects</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Average</th>
                  <th className="px-5 py-4">Grade</th>
                  <th className="px-5 py-4">Report</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {studentResults.map((student, index) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {student.name}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {student.admissionNo}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {student.subjects}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {student.total.toFixed(2)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {student.average.toFixed(2)}%
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {student.grade} · {student.remark}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/results/${student.id}`}
                        className="font-semibold text-cyan-700 hover:text-cyan-900"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
