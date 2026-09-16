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
      { error: "You do not have permission to access attendance." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);

  const classId = searchParams.get("classId")?.trim() ?? "";
  const sessionId = searchParams.get("sessionId")?.trim() ?? "";
  const termId = searchParams.get("termId")?.trim() ?? "";

  if (!classId || !sessionId || !termId) {
    return NextResponse.json(
      {
        error:
          "Class, session, and term are required.",
      },
      { status: 400 },
    );
  }

  const academicSession =
    await prisma.academicSession.findFirst({
      where: {
        id: sessionId,
        schoolId: session.user.schoolId,
      },
      select: {
        id: true,
      },
    });

  if (!academicSession) {
    return NextResponse.json(
      { error: "Academic session not found." },
      { status: 404 },
    );
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
    return NextResponse.json(
      { error: "Term not found for the selected session." },
      { status: 404 },
    );
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
    return NextResponse.json(
      { error: "Class not found for the selected session." },
      { status: 404 },
    );
  }

  const students = await prisma.studentProfile.findMany({
    where: {
      schoolId: session.user.schoolId,
      classId,
      sessionId,
      user: {
        status: "ACTIVE",
      },
    },
    orderBy: [
      {
        user: {
          firstName: "asc",
        },
      },
      {
        user: {
          lastName: "asc",
        },
      },
    ],
    select: {
      id: true,
      admissionNo: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          status: true,
        },
      },
    },
  });

  return NextResponse.json({
    students: students.map((student) => ({
      id: student.id,
      admissionNo: student.admissionNo,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      status: student.user.status,
    })),
  });
}
