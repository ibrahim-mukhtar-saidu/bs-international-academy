"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CreateSectionInput {
  name: string;
  type: "NURSERY" | "PRIMARY" | "JUNIOR_SECONDARY" | "SENIOR_SECONDARY";
}

const VALID_SECTIONS: Record<CreateSectionInput["type"], string> = {
  NURSERY: "Nursery",
  PRIMARY: "Primary",
  JUNIOR_SECONDARY: "Junior Secondary",
  SENIOR_SECONDARY: "Senior Secondary",
};

export async function createSection(input: CreateSectionInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL") {
    throw new Error("You do not have permission to create sections");
  }

  if (!input.type || !(input.type in VALID_SECTIONS)) {
    throw new Error("Invalid section type");
  }

  const expectedName = VALID_SECTIONS[input.type];

  if (input.name.trim() !== expectedName) {
    throw new Error(`Section name must be "${expectedName}"`);
  }

  const existingSection = await prisma.section.findFirst({
    where: {
      schoolId: session.user.schoolId,
      type: input.type,
    },
    select: {
      id: true,
    },
  });

  if (existingSection) {
    throw new Error("This section already exists for the school");
  }

  const createdSection = await prisma.section.create({
    data: {
      name: expectedName,
      type: input.type,
      schoolId: session.user.schoolId,
    },
  });

  return {
    id: createdSection.id,
    name: createdSection.name,
    type: createdSection.type,
  };
}
