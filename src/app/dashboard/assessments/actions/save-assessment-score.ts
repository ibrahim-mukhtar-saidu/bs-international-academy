
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface SaveAssessmentScoreInput {
  assessmentId: string;
  studentId: string;
  score: number;
  feedback?: string;
}

export async function saveAssessmentScore(
  input: SaveAssessmentScoreInput,
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL" &&
    session.user.role !== "TEACHER"
  ) {
    throw new Error(
      "You do not have permission to record assessment scores",
    );
  }

  const assessmentId = input.assessmentId.trim();
  const studentId = input.studentId.trim();
  const score = Number(input.score);
  const feedback = input.feedback?.trim() || null;

  if (!assessmentId || !studentId) {
    throw new Error("Assessment and student are required");
  }

  if (!Number.isFinite(score) || score < 0) {
    throw new Error("Score must be zero or greater");
  }

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
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
      maxScore: true,
      sessionId: true,
      classId: true,
    },
  });

  if (!assessment) {
    throw new Error(
      "Assessment not found or you do not have permission to score it",
    );
  }

  const maxScore = Number(assessment.maxScore);

  if (score > maxScore) {
    throw new Error(
      `Score cannot be greater than the maximum score of ${maxScore}`,
    );
  }

  const student = await prisma.studentProfile.findFirst({
    where: {
      id: studentId,
      schoolId: session.user.schoolId,
      classId: assessment.classId,
      sessionId: assessment.sessionId,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    throw new Error(
      "The selected student does not belong to this assessment class and session",
    );
  }

  const savedScore = await prisma.assessmentScore.upsert({
    where: {
      assessmentId_studentId: {
        assessmentId,
        studentId,
      },
    },
    create: {
      assessmentId,
      studentId,
      score,
      feedback,
    },
    update: {
      score,
      feedback,
      gradedAt: new Date(),
    },
    select: {
      id: true,
      assessmentId: true,
      studentId: true,
      score: true,
      feedback: true,
      gradedAt: true,
    },
  });

  return savedScore;
}
