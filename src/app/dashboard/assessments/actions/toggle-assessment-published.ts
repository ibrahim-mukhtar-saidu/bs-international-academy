"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function toggleAssessmentPublished(assessmentId: string) {
  const session = await auth();

  if (!session?.user?.schoolId || !session.user.role) {
    throw new Error("Unauthorized");
  }

  const allowedRoles = ["ADMIN", "PRINCIPAL", "TEACHER"];

  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("You do not have permission to change assessment status");
  }

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      session: {
        schoolId: session.user.schoolId,
      },
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  const assignment = await prisma.teacherAssignment.findUnique({
    where: {
      id: assessment.teacherAssignmentId,
    },
    include: {
      teacher: {
        select: {
          userId: true,
          schoolId: true,
        },
      },
    },
  });

  if (!assignment || assignment.teacher.schoolId !== session.user.schoolId) {
    throw new Error("Assessment does not belong to your school");
  }

  if (
    session.user.role === "TEACHER" &&
    assignment.teacher.userId !== session.user.id
  ) {
    throw new Error("You can only change your own assessments");
  }

  const updated = await prisma.assessment.update({
    where: {
      id: assessment.id,
    },
    data: {
      isPublished: !assessment.isPublished,
    },
  });

  return {
    success: true,
    isPublished: updated.isPublished,
  };
}
