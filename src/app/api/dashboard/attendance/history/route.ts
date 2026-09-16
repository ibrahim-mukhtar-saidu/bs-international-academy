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

  const records = await prisma.attendance.findMany({
    where,
    orderBy: [
      {
        date: "desc",
      },
      {
        student: {
          user: {
            firstName: "asc",
          },
        },
      },
    ],
    take: 200,
    select: {
      id: true,
      date: true,
      status: true,
      notes: true,
      student: {
        select: {
          admissionNo: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      schoolClass: {
        select: {
          name: true,
          code: true,
        },
      },
      session: {
        select: {
          name: true,
        },
      },
      term: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json({
    records: records.map((record) => ({
      id: record.id,
      date: record.date.toISOString().slice(0, 10),
      status: record.status,
      notes: record.notes,
      studentName:
        `${record.student.user.firstName} ${record.student.user.lastName}`.trim(),
      admissionNo: record.student.admissionNo,
      className: record.schoolClass.name,
      classCode: record.schoolClass.code,
      sessionName: record.session.name,
      termName: record.term.name,
    })),
  });
}
