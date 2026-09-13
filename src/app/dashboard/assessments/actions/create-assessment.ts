
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AssessmentType } from "@/generated/prisma/client";

interface CreateAssessmentInput {
  title: string;
  description?: string;
  type: AssessmentType;
  maxScore: number;
  dueDate?: string;
  sessionId: string;
  termId?: string;
  classId: string;
  teacherAssignmentId: string;
}

export async function createAssessment(input: CreateAssessmentInput) {
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
      "You do not have permission to create assessments",
    );
  }

  const title = input.title.trim();
  const description = input.description?.trim() || null;
  const sessionId = input.sessionId.trim();
  const termId = input.termId?.trim() || null;
  const classId = input.classId.trim();
  const teacherAssignmentId = input.teacherAssignmentId.trim();
  const maxScore = Number(input.maxScore);

  if (!title) {
    throw new Error("Assessment title is required");
  }

  if (!sessionId || !classId || !teacherAssignmentId) {
    throw new Error("Session, class, and teacher assignment are required");
  }

  if (!Object.values(AssessmentType).includes(input.type)) {
    throw new Error("Invalid assessment type");
  }

  if (!Number.isFinite(maxScore) || maxScore <= 0) {
    throw new Error("Maximum score must be greater than zero");
  }

  const academicSession = await prisma.academicSession.findFirst({
    where: {
      id: sessionId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!academicSession) {
    throw new Error("The selected academic session was not found");
  }

  const schoolClass = await prisma.schoolClass.findFirst({
    where: {
      id: classId,
      schoolId: session.user.schoolId,
      sessionId,
    },
    select: {
      id: true,
    },
  });

  if (!schoolClass) {
    throw new Error(
      "The selected class does not belong to the selected academic session",
    );
  }

  if (termId) {
    const term = await prisma.term.findFirst({
      where: {
        id: termId,
        sessionId,
      },
      select: {
        id: true,
      },
    });

    if (!term) {
      throw new Error(
        "The selected term does not belong to the selected academic session",
      );
    }
  }

  const teacherAssignment = await prisma.teacherAssignment.findFirst({
    where: {
      id: teacherAssignmentId,
      sessionId,
      classId,
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
    select: {
      id: true,
      sessionId: true,
      classId: true,
    },
  });

  if (!teacherAssignment) {
    throw new Error(
      "The selected teacher assignment is invalid or you do not have permission to use it",
    );
  }

  let dueDate: Date | null = null;

  if (input.dueDate?.trim()) {
    const parsedDate = new Date(input.dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Invalid due date");
    }

    dueDate = parsedDate;
  }

  return prisma.assessment.create({
    data: {
      title,
      description,
      type: input.type,
      maxScore,
      dueDate,
      sessionId,
      termId,
      classId,
      teacherAssignmentId,
    },
    select: {
      id: true,
      title: true,
      type: true,
      maxScore: true,
      dueDate: true,
      isPublished: true,
      sessionId: true,
      termId: true,
      classId: true,
      teacherAssignmentId: true,
    },
  });
}
