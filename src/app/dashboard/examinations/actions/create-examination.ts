"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

interface CreateExaminationInput {
  name: string;
  description?: string;
  sessionId: string;
  termId: string;
  classId: string;
  maxScore: string;
}

export async function createExamination(input: CreateExaminationInput) {
  const session = await auth();

  if (!session?.user?.schoolId || !session.user.role) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    throw new Error(
      "Only administrators and principals can create examinations",
    );
  }

  const name = input.name.trim();
  const description = input.description?.trim() || null;
  const maxScore = Number(input.maxScore);

  if (!name) {
    throw new Error("Examination name is required");
  }

  if (!input.sessionId || !input.termId || !input.classId) {
    throw new Error("Session, term, and class are required");
  }

  if (!Number.isFinite(maxScore) || maxScore <= 0) {
    throw new Error("Maximum score must be greater than zero");
  }

  const academicSession = await prisma.academicSession.findFirst({
    where: {
      id: input.sessionId,
      schoolId: session.user.schoolId,
    },
  });

  if (!academicSession) {
    throw new Error("Academic session not found");
  }

  const term = await prisma.term.findFirst({
    where: {
      id: input.termId,
      sessionId: input.sessionId,
    },
  });

  if (!term) {
    throw new Error("Term does not belong to the selected session");
  }

  const schoolClass = await prisma.schoolClass.findFirst({
    where: {
      id: input.classId,
      schoolId: session.user.schoolId,
      sessionId: input.sessionId,
    },
  });

  if (!schoolClass) {
    throw new Error(
      "Class does not belong to the selected session and school",
    );
  }

  const existingExaminations = await prisma.examination.findMany({
    where: {
      schoolId: session.user.schoolId,
      sessionId: input.sessionId,
      termId: input.termId,
      classId: input.classId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const normalizedName = name.toLowerCase();

  const existing = existingExaminations.find(
    (examination) => examination.name.trim().toLowerCase() === normalizedName,
  );

  if (existing) {
    throw new Error(
      "An examination with this name already exists for this class, session, and term",
    );
  }

  const examination = await prisma.examination.create({
    data: {
      name,
      description,
      maxScore,
      schoolId: session.user.schoolId,
      sessionId: input.sessionId,
      termId: input.termId,
      classId: input.classId,
    },
  });

  return {
    success: true,
    examinationId: examination.id,
  };
}
