"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const allowedStatuses = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
] as const;

type AttendanceStatus = (typeof allowedStatuses)[number];

export async function saveAttendance(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL" &&
    session.user.role !== "TEACHER"
  ) {
    throw new Error(
      "Only administrators, principals, and teachers can record attendance.",
    );
  }

  const classId = String(formData.get("classId") ?? "").trim();
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const termId = String(formData.get("termId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const dateValue = String(formData.get("date") ?? "").trim();
  const statusValue = String(formData.get("status") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!classId || !sessionId || !termId || !studentId || !dateValue) {
    throw new Error(
      "Class, session, term, student, and date are required.",
    );
  }

  if (!allowedStatuses.includes(statusValue as AttendanceStatus)) {
    throw new Error("Invalid attendance status.");
  }

  const date = new Date(`${dateValue}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid attendance date.");
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

  const schoolClass = await prisma.schoolClass.findFirst({
    where: {
      id: classId,
      schoolId: session.user.schoolId,
      sessionId,
    },
    select: {
      id: true,
    },
  });

  if (!schoolClass) {
    throw new Error("Class not found for the selected session.");
  }

  const student = await prisma.studentProfile.findFirst({
    where: {
      id: studentId,
      schoolId: session.user.schoolId,
      classId,
      sessionId,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    throw new Error(
      "Student does not belong to the selected class and session.",
    );
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_date: {
        studentId,
        date,
      },
    },
    update: {
      status: statusValue as AttendanceStatus,
      notes: notes || null,
      classId,
      sessionId,
      termId,
      schoolId: session.user.schoolId,
    },
    create: {
      date,
      status: statusValue as AttendanceStatus,
      notes: notes || null,
      schoolId: session.user.schoolId,
      studentId,
      classId,
      sessionId,
      termId,
    },
  });

  return {
    id: attendance.id,
    status: attendance.status,
  };
}
