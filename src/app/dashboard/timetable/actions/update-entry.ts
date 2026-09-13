"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DayOfWeek } from "@/generated/prisma/client";

interface UpdateTimetableEntryInput {
  entryId: string;
  sessionId: string;
  classId: string;
  periodId: string;
  assignmentId: string;
  teacherId: string;
  day: DayOfWeek;
}

export async function updateTimetableEntry(
  input: UpdateTimetableEntryInput,
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
      "You do not have permission to update timetable entries",
    );
  }

  const entryId = input.entryId.trim();
  const sessionId = input.sessionId.trim();
  const classId = input.classId.trim();
  const periodId = input.periodId.trim();
  const assignmentId = input.assignmentId.trim();
  const teacherId = input.teacherId.trim();

  if (
    !entryId ||
    !sessionId ||
    !classId ||
    !periodId ||
    !assignmentId ||
    !teacherId
  ) {
    throw new Error("All timetable fields are required");
  }

  if (!Object.values(DayOfWeek).includes(input.day)) {
    throw new Error("Invalid timetable day");
  }

  const existingEntry = await prisma.timetableEntry.findFirst({
    where: {
      id: entryId,
      session: {
        schoolId: session.user.schoolId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!existingEntry) {
    throw new Error("Timetable entry not found");
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
    throw new Error("The selected academic session was not found");
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
    throw new Error(
      "The selected class does not belong to the selected academic session",
    );
  }

  const period = await prisma.timetablePeriod.findFirst({
    where: {
      id: periodId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!period) {
    throw new Error("The selected timetable period was not found");
  }

  const assignment = await prisma.teacherAssignment.findFirst({
    where: {
      id: assignmentId,
      sessionId,
      classId,
      teacherId,
      teacher: {
        schoolId: session.user.schoolId,
      },
    },
    select: {
      id: true,
      teacherId: true,
    },
  });

  if (!assignment) {
    throw new Error(
      "The selected teacher assignment is invalid for this class and session",
    );
  }

  try {
    return await prisma.timetableEntry.update({
      where: {
        id: entryId,
      },
      data: {
        day: input.day,
        sessionId,
        classId,
        periodId,
        assignmentId,
        teacherId,
      },
      select: {
        id: true,
        day: true,
        sessionId: true,
        classId: true,
        periodId: true,
        assignmentId: true,
        teacherId: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("TimetableEntry")
    ) {
      throw new Error(
        "This timetable slot is already occupied by the selected class or teacher",
      );
    }

    throw error;
  }
}
