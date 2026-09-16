"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const allowedStatuses = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
] as const;

type AdmissionStatus = (typeof allowedStatuses)[number];

export async function updateAdmissionStatus(
  applicationId: string,
  status: AdmissionStatus,
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
      "Only administrators and principals can update admission status.",
    );
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid admission status.");
  }

  const application = await prisma.admissionApplication.findFirst({
    where: {
      id: applicationId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!application) {
    throw new Error("Admission application not found.");
  }

  const reviewedAt =
    status === "APPROVED" ||
    status === "REJECTED" ||
    status === "WITHDRAWN"
      ? new Date()
      : null;

  const updatedApplication =
    await prisma.admissionApplication.update({
      where: {
        id: application.id,
      },
      data: {
        status,
        reviewedAt,
      },
      select: {
        id: true,
        reference: true,
        status: true,
        reviewedAt: true,
      },
    });

  return updatedApplication;
}
