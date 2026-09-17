"use server";

import crypto from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CreateAdmissionInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  relationship?: string;
  notes?: string;
  sessionId: string;
  sectionId?: string;
  classId?: string;
}

function generateReference() {
  return `ADM-${new Date().getFullYear()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

export async function createAdmission(input: CreateAdmissionInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    throw new Error(
      "Only administrators and principals can create admission applications.",
    );
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email?.trim().toLowerCase() || undefined;
  const phone = input.phone?.trim() || undefined;
  const gender = input.gender?.trim() || undefined;
  const address = input.address?.trim() || undefined;
  const guardianName = input.guardianName?.trim() || undefined;
  const guardianPhone = input.guardianPhone?.trim() || undefined;
  const guardianEmail =
    input.guardianEmail?.trim().toLowerCase() || undefined;
  const relationship = input.relationship?.trim() || undefined;
  const notes = input.notes?.trim() || undefined;

  if (!firstName) {
    throw new Error("First name is required.");
  }

  if (!lastName) {
    throw new Error("Last name is required.");
  }

  if (!input.sessionId) {
    throw new Error("Academic session is required.");
  }

  let dateOfBirth: Date | undefined;

  if (input.dateOfBirth) {
    const parsedDate = new Date(`${input.dateOfBirth}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date of birth.");
    }

    dateOfBirth = parsedDate;
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
    throw new Error("Academic session not found.");
  }

  let sectionId = input.sectionId?.trim() || undefined;
  const classId = input.classId?.trim() || undefined;

  if (classId) {
    const schoolClass = await prisma.schoolClass.findFirst({
      where: {
        id: classId,
        schoolId: session.user.schoolId,
        sessionId: academicSession.id,
      },
      select: {
        id: true,
        sectionId: true,
      },
    });

    if (!schoolClass) {
      throw new Error(
        "The selected class does not belong to the selected academic session.",
      );
    }

    if (sectionId && schoolClass.sectionId !== sectionId) {
      throw new Error("The selected class does not belong to the selected section.");
    }

    sectionId = schoolClass.sectionId;
  }

  if (sectionId) {
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        schoolId: session.user.schoolId,
      },
      select: {
        id: true,
      },
    });

    if (!section) {
      throw new Error("Section not found.");
    }
  }

  let reference = generateReference();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await prisma.admissionApplication.findUnique({
      where: { reference },
      select: { id: true },
    });

    if (!existing) {
      break;
    }

    reference = generateReference();
  }

  const admission = await prisma.admissionApplication.create({
    data: {
      reference,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      guardianName,
      guardianPhone,
      guardianEmail,
      relationship,
      notes,
      schoolId: session.user.schoolId,
      sessionId: academicSession.id,
      sectionId,
      classId,
    },
  });

  return {
    id: admission.id,
    reference: admission.reference,
    status: admission.status,
  };
}
