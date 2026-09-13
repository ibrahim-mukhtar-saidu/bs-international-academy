"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function deleteTimetableEntry(entryId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    throw new Error(
      "You do not have permission to delete timetable entries",
    );
  }

  const id = entryId.trim();

  if (!id) {
    throw new Error("Timetable entry ID is required");
  }

  const entry = await prisma.timetableEntry.findFirst({
    where: {
      id,
      session: {
        schoolId: session.user.schoolId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!entry) {
    throw new Error("Timetable entry not found");
  }

  await prisma.timetableEntry.delete({
    where: {
      id: entry.id,
    },
  });

  return {
    success: true,
    message: "Timetable entry deleted successfully",
  };
}
