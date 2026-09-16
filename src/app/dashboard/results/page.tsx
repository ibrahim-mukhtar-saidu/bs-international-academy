import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateSubjectResult,
  calculateGrade,
} from "@/lib/results/calculations";

export default async function ResultsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const sessions = await prisma.academicSession.findMany({
    where: {
      schoolId: session.user.schoolId,
    },
    orderBy: {
      startYear: "desc",
    },
    include: {
      terms: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  const currentSession =
    sessions.find((item) => item.isCurrent) ?? sessions[0];

  const currentTerm =
    currentSession?.terms.find((item) => item.isCurrent) ??
    currentSession?.terms[0];

  if (!currentSession || !currentTerm) {
    return (
      <main className="space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-600">
            Academic Results
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Results & Report Cards
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            No academic session or term is available yet.
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-800">
            Academic setup required
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Create an academic session and term before viewing results.
          </p>

          <Link
            href="/dashboard/academic"
            className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Open Academic Setup
          </Link>
        </div>
      </main>
    );
  }

  const classes = await prisma.schoolClass.findMany({
    where: {
      schoolId: session.user.schoolId,
      sessionId: currentSession.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  const selectedClass = classes[0];

  const students = selectedClass
    ? await prisma.studentProfile.findMany({
        where: {
          schoolId: session.user.schoolId,
          classId: selectedClass.id,
          sessionId: currentSession.id,
          user: {
            status: "ACTIVE",
          },
        },
        orderBy: {
          admissionNo: "asc",
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
                classId: selectedClass.id,
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
                classId: selectedClass.id,
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
      })
    : [];

  const studentRows = students.map((student) => {
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

    const subjects = Array.from(subjectMap.values()).map(
      (subject) =>
        calculateSubjectResult(subject),
    );

    const total = subjects.reduce(
      (sum, subject) => sum + subject.finalScore,
      0,
    );

    const average =
      subjects.length > 0 ? total / subjects.length : 0;

    const { grade, remark } = calculateGrade(average);

    return {
      id: student.id,
      admissionNo: student.admissionNo,
      name: `${student.user.firstName} ${student.user.lastName}`,
      subjects,
      total,
      average,
      grade,
      remark,
    };
  });

  return (
    <main className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Academic Performance
          </p>

          <div className="mt-2 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Results & Report Cards
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Review continuous assessment and examination performance
                in one academic result view.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Current Term
              </p>
              <p className="mt-1 font-semibold">
                {currentSession.name} · {currentTerm.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Classes
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {classes.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Selected Class
          </p>
          <p className="mt-2 truncate text-xl font-bold text-slate-950">
            {selectedClass?.name ?? "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Students
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {students.length}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
            Result Formula
          </p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            40% CA + 60% Exam
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-slate-950">
              Student Performance
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {selectedClass?.name ?? "No class selected"} ·{" "}
              {currentTerm.name}
            </p>
          </div>

          {selectedClass && (
            <Link
              href={`/dashboard/results/class/${selectedClass.id}`}
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Open Class Results
            </Link>
          )}
        </div>

        {studentRows.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              📊
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              No result records yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Students, published assessments and examination scores will
              appear here once they are available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Subjects</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Average</th>
                  <th className="px-5 py-3 font-semibold">Grade</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {studentRows.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {student.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {student.admissionNo}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {student.subjects.length}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {student.total.toFixed(2)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {student.average.toFixed(2)}%
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                        {student.grade}
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
