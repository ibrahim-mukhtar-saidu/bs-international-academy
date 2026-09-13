"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CreateAssignmentInput {
  teacherId: string;
  subjectId: string;
  classId: string;
  sessionId: string;
}

export async function createTeacherAssignment(
  input: CreateAssignmentInput,
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    throw new Error(
      "You do not have permission to create teacher assignments",
    );
  }

  const teacherId = input.teacherId.trim();
  const subjectId = input.subjectId.trim();
  const classId = input.classId.trim();
  const sessionId = input.sessionId.trim();

  if (!teacherId) {
    throw new Error("Teacher is required");
  }

  if (!subjectId) {
    throw new Error("Subject is required");
  }

  if (!classId) {
    throw new Error("Class is required");
  }

  if (!sessionId) {
    throw new Error("Academic session is required");
  }

  const [teacher, subject, schoolClass, academicSession] =
    await Promise.all([
      prisma.teacherProfile.findFirst({
        where: {
          id: teacherId,
          schoolId: session.user.schoolId,
        },
        select: {
          id: true,
        },
      }),

      prisma.subject.findFirst({
        where: {
          id: subjectId,
          schoolId: session.user.schoolId,
          isActive: true,
        },
        select: {
          id: true,
        },
      }),

      prisma.schoolClass.findFirst({
        where: {
          id: classId,
          schoolId: session.user.schoolId,
        },
        select: {
          id: true,
          sessionId: true,
        },
      }),

      prisma.academicSession.findFirst({
        where: {
          id: sessionId,
          schoolId: session.user.schoolId,
        },
        select: {
          id: true,
        },
      }),
    ]);

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  if (!subject) {
    throw new Error("Subject not found or inactive");
  }

  if (!schoolClass) {
    throw new Error("Class not found");
  }

  if (!academicSession) {
    throw new Error("Academic session not found");
  }

  if (schoolClass.sessionId !== sessionId) {
    throw new Error(
      "The selected class does not belong to the selected academic session",
    );
  }

  const existingAssignment =
    await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_subjectId_classId_sessionId: {
          teacherId,
          subjectId,
          classId,
          sessionId,
        },
      },
      select: {
        id: true,
      },
    });

  if (existingAssignment) {
    throw new Error(
      "This teacher is already assigned to this subject and class for the selected session",
    );
  }

  const assignment = await prisma.teacherAssignment.create({
    data: {
      teacherId,
      subjectId,
      classId,
      sessionId,
    },
    select: {
      id: true,
      teacherId: true,
      subjectId: true,
      classId: true,
      sessionId: true,
    },
  });

  return assignment;
}
