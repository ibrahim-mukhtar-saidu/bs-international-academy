
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ScoreForm from "./score-form";
import PublishButton from "./publish-button";

interface AssessmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssessmentDetailPage({
  params,
}: AssessmentPageProps) {
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
        You do not have permission to access this assessment.
      </div>
    );
  }

  const { id } = await params;

  const assessment = await prisma.assessment.findFirst({
    where: {
      id,
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
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      maxScore: true,
      dueDate: true,
      isPublished: true,
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
  });

  if (!assessment) {
    notFound();
  }

  const students = await prisma.studentProfile.findMany({
    where: {
      schoolId: session.user.schoolId,
      classId: assessment.classId,
      sessionId: assessment.sessionId,
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
      parents: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });

  const scores = await prisma.assessmentScore.findMany({
    where: {
      assessmentId: assessment.id,
      student: {
        schoolId: session.user.schoolId,
      },
    },
    select: {
      id: true,
      studentId: true,
      score: true,
      feedback: true,
    },
  });

  const scoreMap = new Map(
    scores.map((score) => [
      score.studentId,
      {
        id: score.id,
        score: score.score.toString(),
        feedback: score.feedback ?? "",
      },
    ]),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/assessments"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← Back to Assignments & Tests
          </Link>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {assessment.title}
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Record and update student scores for this assessment.
          </p>
        </div>

        <PublishButton
          assessmentId={assessment.id}
          isPublished={assessment.isPublished}
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Type
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {assessment.type}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Subject
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {assessment.teacherAssignment.subject.name} (
            {assessment.teacherAssignment.subject.code})
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Class
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {assessment.schoolClass.name} ({assessment.schoolClass.code})
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Maximum Score
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {assessment.maxScore.toString()}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Student Scores
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {students.length} active student
          {students.length === 1 ? "" : "s"} in this class.
        </p>

        {students.length === 0 ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No active students are currently registered in this class for the
            selected academic session.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {students.map((student) => {
              const existingScore = scoreMap.get(student.id);

              return (
                <ScoreForm
                  key={student.id}
                  assessmentId={assessment.id}
                  studentId={student.id}
                  studentName={`${student.user.firstName} ${student.user.lastName}`}
                  admissionNo={student.admissionNo}
                  maxScore={assessment.maxScore.toString()}
                  existingScore={existingScore?.score ?? ""}
                  existingFeedback={existingScore?.feedback ?? ""}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
