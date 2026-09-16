import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL" &&
    session.user.role !== "TEACHER"
  ) {
    return NextResponse.json(
      { error: "You do not have permission to view attendance." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);

  const classId = searchParams.get("classId")?.trim() ?? "";
  const dateValue = searchParams.get("date")?.trim() ?? "";

  const where: {
    schoolId: string;
    classId?: string;
    date?: {
      gte: Date;
      lt: Date;
    };
  } = {
    schoolId: session.user.schoolId,
  };

  if (classId) {
    where.classId = classId;
  }

  if (dateValue) {
    const startDate = new Date(`${dateValue}T00:00:00.000Z`);
    const endDate = new Date(`${dateValue}T00:00:00.000Z`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return NextResponse.json(
        { error: "Invalid date." },
        { status: 400 },
      );
    }

    endDate.setUTCDate(endDate.getUTCDate() + 1);

    where.date = {
      gte: startDate,
      lt: endDate,
    };
  }

  const [total, present, absent, late, excused] =
    await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.count({
        where: {
          ...where,
          status: "PRESENT",
        },
      }),
      prisma.attendance.count({
        where: {
          ...where,
          status: "ABSENT",
        },
      }),
      prisma.attendance.count({
        where: {
          ...where,
          status: "LATE",
        },
      }),
      prisma.attendance.count({
        where: {
          ...where,
          status: "EXCUSED",
        },
      }),
    ]);

  const attendanceRate =
    total > 0
      ? Number((((present + late) / total) * 100).toFixed(1))
      : 0;

  return NextResponse.json({
    total,
    present,
    absent,
    late,
    excused,
    attendanceRate,
  });
}
