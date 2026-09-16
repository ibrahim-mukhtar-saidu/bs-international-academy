"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function assignStudentFee(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    throw new Error(
      "Only administrators and principals can assign student fees.",
    );
  }

  const studentId = String(formData.get("studentId") ?? "").trim();
  const feeStructureId = String(
    formData.get("feeStructureId") ?? "",
  ).trim();
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const termId = String(formData.get("termId") ?? "").trim();
  const amountValue = String(formData.get("amountDue") ?? "").trim();
  const dueDateValue = String(formData.get("dueDate") ?? "").trim();

  if (!studentId || !feeStructureId || !sessionId || !termId) {
    throw new Error("Student, fee, session, and term are required.");
  }

  const amountDue = Number(amountValue);

  if (!Number.isFinite(amountDue) || amountDue <= 0) {
    throw new Error("Amount due must be greater than zero.");
  }

  const student = await prisma.studentProfile.findFirst({
    where: {
      id: studentId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    throw new Error("Student not found.");
  }

  const feeStructure = await prisma.feeStructure.findFirst({
    where: {
      id: feeStructureId,
      schoolId: session.user.schoolId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!feeStructure) {
    throw new Error("Fee structure not found or inactive.");
  }

  const academicSession = await prisma.academicSession.findFirst({
    where: {
      id: sessionId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!academicSession) {
    throw new Error("Academic session not found.");
  }

  const term = await prisma.term.findFirst({
    where: {
      id: termId,
      sessionId,
    },
    select: {
      id: true,
    },
  });

  if (!term) {
    throw new Error("Term not found for the selected session.");
  }

  const existingFee = await prisma.studentFee.findUnique({
    where: {
      feeStructureId_studentId_sessionId_termId: {
        feeStructureId,
        studentId,
        sessionId,
        termId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingFee) {
    throw new Error(
      "This fee has already been assigned to this student for the selected session and term.",
    );
  }

  const studentFee = await prisma.studentFee.create({
    data: {
      amountDue,
      status: "PENDING",
      dueDate: dueDateValue ? new Date(dueDateValue) : null,
      feeStructureId,
      studentId,
      sessionId,
      termId,
    },
  });

  return {
    id: studentFee.id,
  };
}
