"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

interface CreateTeacherInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeNo: string;
  password: string;
}

export async function createTeacher(input: CreateTeacherInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL") {
    throw new Error("You do not have permission to create teachers");
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || undefined;
  const employeeNo = input.employeeNo.trim().toUpperCase();
  const password = input.password;

  if (!firstName) {
    throw new Error("First name is required");
  }

  if (!lastName) {
    throw new Error("Last name is required");
  }

  if (!email) {
    throw new Error("Email is required");
  }

  if (!employeeNo) {
    throw new Error("Employee number is required");
  }

  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
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

  const existingTeacher = await prisma.teacherProfile.findFirst({
    where: {
      schoolId: session.user.schoolId,
      employeeNo,
    },
    select: {
      id: true,
    },
  });

  if (existingTeacher) {
    throw new Error("This employee number already exists for the school");
  }

  const passwordHash = await hashPassword(password);

  const teacher = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: "TEACHER",
        status: "ACTIVE",
        schoolId: session.user.schoolId,
      },
    });

    const teacherProfile = await tx.teacherProfile.create({
      data: {
        employeeNo,
        userId: user.id,
        schoolId: session.user.schoolId,
      },
    });

    return {
      userId: user.id,
      teacherProfileId: teacherProfile.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      employeeNo: teacherProfile.employeeNo,
      status: user.status,
    };
  });

  return teacher;
}
