"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CreateSessionInput {
  name: string;
  startYear: number;
  endYear: number;
  isCurrent: boolean;
}

export async function createAcademicSession(
  input: CreateSessionInput,
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL") {
    throw new Error("You do not have permission to create academic sessions");
  }

  const name = input.name.trim();

  if (!name) {
    throw new Error("Session name is required");
  }

  if (!Number.isInteger(input.startYear) || !Number.isInteger(input.endYear)) {
    throw new Error("Start year and end year must be valid years");
  }

  if (input.endYear !== input.startYear + 1) {
    throw new Error("End year must be exactly one year after start year");
  }

  const existingSession = await prisma.academicSession.findFirst({
    where: {
      schoolId: session.user.schoolId,
      name,
    },
    select: {
      id: true,
    },
  });

  if (existingSession) {
    throw new Error("This academic session already exists");
  }

  const createdSession = await prisma.$transaction(async (tx) => {
    if (input.isCurrent) {
      await tx.academicSession.updateMany({
        where: {
          schoolId: session.user.schoolId,
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      });
    }

    return tx.academicSession.create({
      data: {
        name,
        startYear: input.startYear,
        endYear: input.endYear,
        isCurrent: input.isCurrent,
        schoolId: session.user.schoolId,
      },
    });
  });

  return {
    id: createdSession.id,
    name: createdSession.name,
    startYear: createdSession.startYear,
    endYear: createdSession.endYear,
    isCurrent: createdSession.isCurrent,
  };
}
