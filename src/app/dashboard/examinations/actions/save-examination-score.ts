"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface SaveExaminationScoreInput {
  examinationId: string;
  studentId: string;
  subjectId: string;
  score: number;
  feedback?: string;
}

export async function saveExaminationScore(
  input: SaveExaminationScoreInput,
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
      "You do not have permission to record examination scores",
    );
  }

  const examinationId = input.examinationId.trim();
  const studentId = input.studentId.trim();
  const subjectId = input.subjectId.trim();
  const score = Number(input.score);
  const feedback = input.feedback?.trim() || null;

  if (!examinationId || !studentId || !subjectId) {
    throw new Error(
      "Examination, student, and subject are required",
    );
  }

  if (!Number.isFinite(score) || score < 0) {
    throw new Error("Score must be zero or greater");
  }

  const examination = await prisma.examination.findFirst({
    where: {
      id: examinationId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
      maxScore: true,
      sessionId: true,
      classId: true,
    },
  });

  if (!examination) {
    throw new Error(
      "Examination not found or you do not have permission to score it",
    );
  }

  const maxScore = Number(examination.maxScore);

  if (score > maxScore) {
    throw new Error(
      `Score cannot be greater than the maximum score of ${maxScore}`,
    );
  }

  const student = await prisma.studentProfile.findFirst({
    where: {
      id: studentId,
      schoolId: session.user.schoolId,
      classId: examination.classId,
      sessionId: examination.sessionId,
      user: {
        status: "ACTIVE",
      },
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    throw new Error(
      "The selected student does not belong to this examination class and session",
    );
  }

  const subject = await prisma.subject.findFirst({
    where: {
      id: subjectId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!subject) {
    throw new Error("Subject not found");
  }

  const assignment = await prisma.teacherAssignment.findFirst({
    where: {
      subjectId,
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
    select: {
      id: true,
    },
  });

  if (!assignment) {
    throw new Error(
      "This subject is not assigned to the selected class and session",
    );
  }

  const savedScore = await prisma.examinationScore.upsert({
    where: {
      examinationId_studentId_subjectId: {
        examinationId,
        studentId,
        subjectId,
      },
    },
    create: {
      examinationId,
      studentId,
      subjectId,
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
      examinationId: true,
      studentId: true,
      subjectId: true,
      score: true,
      feedback: true,
      gradedAt: true,
    },
  });

  return savedScore;
}
