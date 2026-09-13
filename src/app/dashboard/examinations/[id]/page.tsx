import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ScoreForm from "./score-form";

interface ExaminationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExaminationDetailPage({
  params,
}: ExaminationPageProps) {
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
        You do not have permission to access this examination.
      </div>
    );
  }

  const { id } = await params;

  const examination = await prisma.examination.findFirst({
    where: {
      id,
      schoolId: session.user.schoolId,
      ...(session.user.role === "TEACHER"
        ? {
            schoolClass: {
              teacherAssignments: {
                some: {
                  teacher: {
                    userId: session.user.id,
                    schoolId: session.user.schoolId,
                  },
                },
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      maxScore: true,
      sessionId: true,
      classId: true,
      term: {
        select: {
          name: true,
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
  });

  if (!examination) {
    notFound();
  }

  const [subjects, students, scores] = await Promise.all([
    prisma.subject.findMany({
      where: {
        schoolId: session.user.schoolId,
        isActive: true,
        teacherAssignments: {
          some: {
            classId: examination.classId,
            sessionId: examination.sessionId,
            ...(session.user.role === "TEACHER"
              ? {
                  teacher: {
                    userId: session.user.id,
                    schoolId: session.user.schoolId,
                  },
                }
              : {}),
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),

    prisma.studentProfile.findMany({
      where: {
        schoolId: session.user.schoolId,
        classId: examination.classId,
        sessionId: examination.sessionId,
        user: {
          status: "ACTIVE",
        },
      },
      orderBy: {
        admissionNo: "asc",
      },
      select: {
        id: true,
        admissionNo: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),

    prisma.examinationScore.findMany({
      where: {
        examinationId: examination.id,
        student: {
          schoolId: session.user.schoolId,
        },
      },
      select: {
        id: true,
        studentId: true,
        subjectId: true,
        score: true,
        feedback: true,
      },
    }),
  ]);

  const scoreMap = new Map(
    scores.map((score) => [
      `${score.studentId}:${score.subjectId}`,
      {
        id: score.id,
        score: score.score.toString(),
        feedback: score.feedback ?? "",
      },
    ]),
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/examinations"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to Examinations
        </Link>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          {examination.name}
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Record and update student examination scores.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Session
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {examination.session.name}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Term
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {examination.term.name}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Class
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {examination.schoolClass.name} ({examination.schoolClass.code})
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Maximum Score
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {examination.maxScore.toString()}
          </p>
        </div>
      </section>

      {examination.description && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Description
          </p>
          <p className="mt-2 text-sm text-slate-700">
            {examination.description}
          </p>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Examination Subjects
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {subjects.length} subject
          {subjects.length === 1 ? "" : "s"} available for this class.
        </p>

        {subjects.length === 0 ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No active subjects are assigned to this class for the selected
            academic session.
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="font-medium text-slate-900">
                  {subject.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {subject.code}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Student Scores
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Enter scores for each student and subject.
        </p>

        {students.length === 0 ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No active students are currently registered in this class for the
            selected academic session.
          </div>
        ) : subjects.length === 0 ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No active subjects are assigned to this class for the selected
            academic session.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {students.flatMap((student) =>
              subjects.map((subject) => {
                const existingScore = scoreMap.get(
                  `${student.id}:${subject.id}`,
                );

                return (
                  <ScoreForm
                    key={`${student.id}:${subject.id}`}
                    examinationId={examination.id}
                    studentId={student.id}
                    studentName={`${student.user.firstName} ${student.user.lastName}`}
                    admissionNo={student.admissionNo}
                    subjectId={subject.id}
                    subjectName={subject.name}
                    subjectCode={subject.code}
                    maxScore={examination.maxScore.toString()}
                    existingScore={existingScore?.score ?? ""}
                    existingFeedback={existingScore?.feedback ?? ""}
                  />
                );
              }),
            )}
          </div>
        )}
      </section>
    </div>
  );
}
