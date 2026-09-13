"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CreateSubjectInput {
  name: string;
  code: string;
  description?: string;
}

export async function createSubject(input: CreateSubjectInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL") {
    throw new Error("You do not have permission to create subjects");
  }

  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();
  const description = input.description?.trim() || undefined;

  if (!name) {
    throw new Error("Subject name is required");
  }

  if (!code) {
    throw new Error("Subject code is required");
  }

  const existingSubject = await prisma.subject.findFirst({
    where: {
      schoolId: session.user.schoolId,
      code,
    },
    select: {
      id: true,
    },
  });

  if (existingSubject) {
    throw new Error("This subject code already exists for the school");
  }

  const subject = await prisma.subject.create({
    data: {
      name,
      code,
      description,
      schoolId: session.user.schoolId,
    },
  });

  return {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    description: subject.description,
    isActive: subject.isActive,
  };
}
