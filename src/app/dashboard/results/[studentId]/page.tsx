import PrintButton from "./print-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateGrade,
  calculateSubjectResult,
} from "@/lib/results/calculations";

interface ReportPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function StudentReportPage({
  params,
}: ReportPageProps) {
  const session = await auth();
  const { studentId } = await params;

  if (!session?.user) {
    return null;
  }

  const student = await prisma.studentProfile.findFirst({
    where: {
      id: studentId,
      schoolId: session.user.schoolId,
      user: {
        status: "ACTIVE",
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      schoolClass: true,
      session: true,
    },
  });

  if (!student || !student.classId || !student.sessionId) {
    notFound();
  }

  const currentTerm =
    await prisma.term.findFirst({
      where: {
        sessionId: student.sessionId,
        isCurrent: true,
      },
      orderBy: {
        number: "asc",
      },
    }) ??
    await prisma.term.findFirst({
      where: {
        sessionId: student.sessionId,
      },
      orderBy: {
        number: "asc",
      },
    });

  if (!currentTerm) {
    notFound();
  }

  const assessmentScores =
    await prisma.assessmentScore.findMany({
      where: {
        studentId: student.id,
        assessment: {
          sessionId: student.sessionId,
          classId: student.classId,
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
    });

  const examinationScores =
    await prisma.examinationScore.findMany({
      where: {
        studentId: student.id,
        examination: {
          sessionId: student.sessionId,
          classId: student.classId,
          termId: currentTerm.id,
          isPublished: true,
        },
      },
      include: {
        examination: true,
        subject: true,
      },
    });

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

  for (const score of assessmentScores) {
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

  for (const score of examinationScores) {
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

  const results = Array.from(subjectMap.values())
    .map((subject) => calculateSubjectResult(subject))
    .sort((a, b) =>
      a.subjectName.localeCompare(b.subjectName),
    );

  const total = results.reduce(
    (sum, result) => sum + result.finalScore,
    0,
  );

  const average =
    results.length > 0 ? total / results.length : 0;

  const { grade, remark } = calculateGrade(average);

  return (
    <main className="report-page space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/dashboard/results"
            className="print-hidden text-sm font-medium text-cyan-700 hover:text-cyan-900"
          >
            ← Back to Results
          </Link>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Student Report Card
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {student.session?.name} · {currentTerm.name}
          </p>
        </div>

        <div className="print-hidden">
          <PrintButton />
        </div>
      </div>

      <section className="report-card overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 px-6 py-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            BS INTERNATIONAL ACADEMY
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Student Academic Report
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Official academic performance summary
          </p>
        </div>

        <div className="grid gap-5 border-b border-slate-200 p-6 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Student
            </p>
            <p className="mt-1 font-bold text-slate-950">
              {student.user.firstName} {student.user.lastName}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Admission No
            </p>
            <p className="mt-1 font-bold text-slate-950">
              {student.admissionNo}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Class
            </p>
            <p className="mt-1 font-bold text-slate-950">
              {student.schoolClass?.name ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Term
            </p>
            <p className="mt-1 font-bold text-slate-950">
              {currentTerm.name}
            </p>
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Subjects
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {results.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Score
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {total.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-cyan-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
              Overall Average
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {average.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-950">
              Subject Performance
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Continuous assessment contributes 40% and examination
              contributes 60%.
            </p>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <p className="font-semibold text-slate-800">
                No published results available
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Published assessment and examination scores will appear
                here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">CA</th>
                    <th className="px-4 py-3">Exam</th>
                    <th className="px-4 py-3">Final</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Remark</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {results.map((result) => (
                    <tr key={result.subjectId}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {result.subjectName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {result.subjectCode}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {result.caPercentage.toFixed(2)}%
                      </td>

                      <td className="px-4 py-4">
                        {result.examPercentage.toFixed(2)}%
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-900">
                        {result.finalScore.toFixed(2)}%
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                          {result.grade}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {result.remark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex flex-col justify-between gap-5 rounded-2xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Overall Result
              </p>
              <p className="mt-1 text-2xl font-bold">
                {grade} · {remark}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400">
                Average
              </p>
              <p className="text-3xl font-bold text-cyan-300">
                {average.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
