"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

interface EnrollAdmissionInput {
  applicationId: string;
  email: string;
  password: string;
  admissionNo: string;
}

export async function enrollAdmission(
  input: EnrollAdmissionInput,
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
      "Only administrators and principals can enroll students.",
    );
  }

  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const admissionNo = input.admissionNo.trim().toUpperCase();

  if (!input.applicationId) {
    throw new Error("Admission application is required.");
  }

  if (!email) {
    throw new Error("Student email is required.");
  }

  if (!password || password.length < 8) {
    throw new Error("Student password must be at least 8 characters.");
  }

  if (!admissionNo) {
    throw new Error("Admission number is required.");
  }

  const application = await prisma.admissionApplication.findFirst({
    where: {
      id: input.applicationId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
      status: true,
      firstName: true,
      lastName: true,
      email: true,
      dateOfBirth: true,
      gender: true,
      address: true,
      sessionId: true,
      classId: true,
      studentId: true,
    },
  });

  if (!application) {
    throw new Error("Admission application not found.");
  }

  if (application.status !== "APPROVED") {
    throw new Error(
      "Only approved admission applications can be enrolled.",
    );
  }

  if (application.studentId) {
    throw new Error(
      "This admission application has already been enrolled.",
    );
  }

  if (!application.classId) {
    throw new Error(
      "A class must be assigned before the applicant can be enrolled.",
    );
  }

  const [existingUser, existingStudent, schoolClass] =
    await Promise.all([
      prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      }),

      prisma.studentProfile.findFirst({
        where: {
          schoolId: session.user.schoolId,
          admissionNo,
        },
        select: {
          id: true,
        },
      }),

      prisma.schoolClass.findFirst({
        where: {
          id: application.classId,
          schoolId: session.user.schoolId,
          sessionId: application.sessionId,
        },
        select: {
          id: true,
          sessionId: true,
        },
      }),
    ]);

  if (existingUser) {
    throw new Error(
      "A user with this email already exists.",
    );
  }

  if (existingStudent) {
    throw new Error(
      "This admission number already exists for the school.",
    );
  }

  if (!schoolClass) {
    throw new Error(
      "The assigned class could not be found for the selected academic session.",
    );
  }

  const passwordHash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName: application.firstName,
        lastName: application.lastName,
        role: "STUDENT",
        status: "ACTIVE",
        schoolId: session.user.schoolId,
      },
    });

    const studentProfile = await tx.studentProfile.create({
      data: {
        admissionNo,
        dateOfBirth: application.dateOfBirth,
        gender: application.gender,
        address: application.address,
        userId: user.id,
        schoolId: session.user.schoolId,
        classId: schoolClass.id,
        sessionId: schoolClass.sessionId,
      },
    });

    const updatedApplication =
      await tx.admissionApplication.update({
        where: {
          id: application.id,
        },
        data: {
          studentId: studentProfile.id,
        },
        select: {
          id: true,
          reference: true,
          studentId: true,
        },
      });

    return {
      userId: user.id,
      studentId: studentProfile.id,
      admission: updatedApplication,
      email: user.email,
      admissionNo: studentProfile.admissionNo,
    };
  });

  return result;
}
