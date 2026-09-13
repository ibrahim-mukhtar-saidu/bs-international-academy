"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CreateTermInput {
  sessionId: string;
  name: string;
  number: number;
  isCurrent: boolean;
}

const VALID_TERM_NAMES: Record<number, string> = {
  1: "First Term",
  2: "Second Term",
  3: "Third Term",
};

export async function createAcademicTerm(input: CreateTermInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL") {
    throw new Error("You do not have permission to create academic terms");
  }

  if (!input.sessionId) {
    throw new Error("Academic session is required");
  }

  if (![1, 2, 3].includes(input.number)) {
    throw new Error("Term number must be 1, 2, or 3");
  }

  const expectedName = VALID_TERM_NAMES[input.number];

  if (input.name.trim() !== expectedName) {
    throw new Error(`Term name must be "${expectedName}"`);
  }

  const academicSession = await prisma.academicSession.findFirst({
    where: {
      id: input.sessionId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!academicSession) {
    throw new Error("Academic session not found");
  }

  const existingTerm = await prisma.term.findFirst({
    where: {
      sessionId: academicSession.id,
      number: input.number,
    },
    select: {
      id: true,
    },
  });

  if (existingTerm) {
    throw new Error("This term already exists for the selected session");
  }

  const createdTerm = await prisma.$transaction(async (tx) => {
    if (input.isCurrent) {
      await tx.term.updateMany({
        where: {
          sessionId: academicSession.id,
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      });
    }

    return tx.term.create({
      data: {
        name: expectedName,
        number: input.number,
        isCurrent: input.isCurrent,
        sessionId: academicSession.id,
      },
    });
  });

  return {
    id: createdTerm.id,
    name: createdTerm.name,
    number: createdTerm.number,
    isCurrent: createdTerm.isCurrent,
    sessionId: createdTerm.sessionId,
  };
}
