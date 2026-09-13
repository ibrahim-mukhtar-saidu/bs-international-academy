"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

interface CreateStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  admissionNo: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  classId: string;
  sessionId: string;
}

export async function createStudent(input: CreateStudentInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL") {
    throw new Error("You do not have permission to create students");
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const admissionNo = input.admissionNo.trim().toUpperCase();
  const gender = input.gender?.trim() || undefined;
  const address = input.address?.trim() || undefined;

  if (!firstName) {
    throw new Error("First name is required");
  }

  if (!lastName) {
    throw new Error("Last name is required");
  }

  if (!email) {
    throw new Error("Email is required");
  }

  if (!admissionNo) {
    throw new Error("Admission number is required");
  }

  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  if (!input.classId) {
    throw new Error("Class is required");
  }

  if (!input.sessionId) {
    throw new Error("Academic session is required");
  }

  let dateOfBirth: Date | undefined;

  if (input.dateOfBirth) {
    const parsedDate = new Date(input.dateOfBirth);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date of birth");
    }

    dateOfBirth = parsedDate;
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

  const existingStudent = await prisma.studentProfile.findFirst({
    where: {
      schoolId: session.user.schoolId,
      admissionNo,
    },
    select: {
      id: true,
    },
  });

  if (existingStudent) {
    throw new Error("This admission number already exists for the school");
  }

  const [academicSession, schoolClass] = await Promise.all([
    prisma.academicSession.findFirst({
      where: {
        id: input.sessionId,
        schoolId: session.user.schoolId,
      },
      select: {
        id: true,
      },
    }),

    prisma.schoolClass.findFirst({
      where: {
        id: input.classId,
        schoolId: session.user.schoolId,
      },
      select: {
        id: true,
        sessionId: true,
      },
    }),
  ]);

  if (!academicSession) {
    throw new Error("Academic session not found");
  }

  if (!schoolClass) {
    throw new Error("Class not found");
  }

  if (schoolClass.sessionId !== academicSession.id) {
    throw new Error(
      "The selected class does not belong to the selected academic session",
    );
  }

  const passwordHash = await hashPassword(password);

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: "STUDENT",
        status: "ACTIVE",
        schoolId: session.user.schoolId,
      },
    });

    const studentProfile = await tx.studentProfile.create({
      data: {
        admissionNo,
        dateOfBirth,
        gender,
        address,
        userId: user.id,
        schoolId: session.user.schoolId,
        classId: schoolClass.id,
        sessionId: academicSession.id,
      },
    });

    return {
      userId: user.id,
      studentProfileId: studentProfile.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      admissionNo: studentProfile.admissionNo,
      classId: studentProfile.classId,
      sessionId: studentProfile.sessionId,
      status: user.status,
    };
  });

  return student;
}
