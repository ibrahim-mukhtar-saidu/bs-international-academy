"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CreateClassInput {
  name: string;
  code: string;
  capacity?: number;
  sectionId: string;
  sessionId: string;
}

export async function createSchoolClass(input: CreateClassInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL") {
    throw new Error("You do not have permission to create classes");
  }

  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();

  if (!name) {
    throw new Error("Class name is required");
  }

  if (!code) {
    throw new Error("Class code is required");
  }

  if (!input.sectionId) {
    throw new Error("Section is required");
  }

  if (!input.sessionId) {
    throw new Error("Academic session is required");
  }

  if (
    input.capacity !== undefined &&
    (!Number.isInteger(input.capacity) || input.capacity <= 0)
  ) {
    throw new Error("Capacity must be a positive whole number");
  }

  const [academicSession, section] = await Promise.all([
    prisma.academicSession.findFirst({
      where: {
        id: input.sessionId,
        schoolId: session.user.schoolId,
      },
      select: {
        id: true,
      },
    }),

    prisma.section.findFirst({
      where: {
        id: input.sectionId,
        schoolId: session.user.schoolId,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!academicSession) {
    throw new Error("Academic session not found");
  }

  if (!section) {
    throw new Error("Section not found");
  }

  const existingClass = await prisma.schoolClass.findFirst({
    where: {
      schoolId: session.user.schoolId,
      code,
      sessionId: academicSession.id,
    },
    select: {
      id: true,
    },
  });

  if (existingClass) {
    throw new Error(
      "This class code already exists for the selected academic session",
    );
  }

  const createdClass = await prisma.schoolClass.create({
    data: {
      name,
      code,
      capacity: input.capacity,
      schoolId: session.user.schoolId,
      sectionId: section.id,
      sessionId: academicSession.id,
    },
  });

  return {
    id: createdClass.id,
    name: createdClass.name,
    code: createdClass.code,
    capacity: createdClass.capacity,
    sectionId: createdClass.sectionId,
    sessionId: createdClass.sessionId,
  };
}
