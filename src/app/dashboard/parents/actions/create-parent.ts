"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

interface CreateParentInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  relationship?: string;
  studentId: string;
}

export async function createParent(input: CreateParentInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL") {
    throw new Error("You do not have permission to create parents");
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || undefined;
  const password = input.password;
  const relationship = input.relationship?.trim() || undefined;

  if (!firstName) {
    throw new Error("First name is required");
  }

  if (!lastName) {
    throw new Error("Last name is required");
  }

  if (!email) {
    throw new Error("Email is required");
  }

  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  if (!input.studentId) {
    throw new Error("Student is required");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const student = await prisma.studentProfile.findFirst({
    where: {
      id: input.studentId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const passwordHash = await hashPassword(password);

  const parent = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: "PARENT",
        status: "ACTIVE",
        schoolId: session.user.schoolId,
      },
    });

    const parentProfile = await tx.parentProfile.create({
      data: {
        relationship,
        userId: user.id,
        schoolId: session.user.schoolId,
      },
    });

    await tx.parentStudent.create({
      data: {
        parentId: parentProfile.id,
        studentId: student.id,
      },
    });

    return {
      userId: user.id,
      parentProfileId: parentProfile.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      studentId: student.id,
      status: user.status,
    };
  });

  return parent;
}
