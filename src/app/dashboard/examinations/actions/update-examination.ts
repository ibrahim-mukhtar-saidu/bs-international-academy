"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

interface UpdateExaminationInput {
  examinationId: string;
  name: string;
  description?: string;
  maxScore: string;
}

export async function updateExamination(
  input: UpdateExaminationInput,
) {
  const session = await auth();

  if (!session?.user?.schoolId || !session.user.role) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    throw new Error(
      "Only administrators and principals can update examinations",
    );
  }

  const examinationId = input.examinationId.trim();
  const name = input.name.trim();
  const description = input.description?.trim() || null;
  const maxScore = Number(input.maxScore);

  if (!examinationId) {
    throw new Error("Examination ID is required");
  }

  if (!name) {
    throw new Error("Examination name is required");
  }

  if (!Number.isFinite(maxScore) || maxScore <= 0) {
    throw new Error("Maximum score must be greater than zero");
  }

  const examination = await prisma.examination.findFirst({
    where: {
      id: examinationId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
      sessionId: true,
      termId: true,
      classId: true,
    },
  });

  if (!examination) {
    throw new Error("Examination not found");
  }

  const existingExaminations = await prisma.examination.findMany({
    where: {
      schoolId: session.user.schoolId,
      sessionId: examination.sessionId,
      termId: examination.termId,
      classId: examination.classId,
      NOT: {
        id: examination.id,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const normalizedName = name.toLowerCase();

  const duplicate = existingExaminations.find(
    (existing) =>
      existing.name.trim().toLowerCase() === normalizedName,
  );

  if (duplicate) {
    throw new Error(
      "An examination with this name already exists for this class, session, and term",
    );
  }

  const updated = await prisma.examination.update({
    where: {
      id: examination.id,
    },
    data: {
      name,
      description,
      maxScore,
    },
    select: {
      id: true,
      name: true,
      description: true,
      maxScore: true,
      isPublished: true,
      updatedAt: true,
    },
  });

  return {
    success: true,
    examination: updated,
  };
}
