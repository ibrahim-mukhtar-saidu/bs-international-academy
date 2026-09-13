"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CreatePeriodInput {
  name: string;
  startTime: string;
  endTime: string;
  order: number;
}

export async function createTimetablePeriod(input: CreatePeriodInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    throw new Error(
      "You do not have permission to create timetable periods",
    );
  }

  const name = input.name.trim();
  const startTime = input.startTime.trim();
  const endTime = input.endTime.trim();
  const order = Number(input.order);

  if (!name) {
    throw new Error("Period name is required");
  }

  if (!/^\d{2}:\d{2}$/.test(startTime)) {
    throw new Error("Start time must use HH:MM format");
  }

  if (!/^\d{2}:\d{2}$/.test(endTime)) {
    throw new Error("End time must use HH:MM format");
  }

  if (!Number.isInteger(order) || order < 1) {
    throw new Error("Period order must be a positive integer");
  }

  if (startTime >= endTime) {
    throw new Error("End time must be later than start time");
  }

  const existingPeriod = await prisma.timetablePeriod.findUnique({
    where: {
      schoolId_order: {
        schoolId: session.user.schoolId,
        order,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingPeriod) {
    throw new Error("A timetable period with this order already exists");
  }

  return prisma.timetablePeriod.create({
    data: {
      name,
      startTime,
      endTime,
      order,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      order: true,
    },
  });
}
