"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CreateAnnouncementInput {
  title: string;
  content: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  audience?:
    | "ALL"
    | "ADMIN"
    | "PRINCIPAL"
    | "TEACHER"
    | "STUDENT"
    | "PARENT";
  sessionId?: string;
  expiresAt?: string;
  publishNow?: boolean;
}

export async function createAnnouncement(
  input: CreateAnnouncementInput,
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
      "Only administrators and principals can create announcements.",
    );
  }

  const title = input.title.trim();
  const content = input.content.trim();

  if (!title) {
    throw new Error("Announcement title is required.");
  }

  if (!content) {
    throw new Error("Announcement content is required.");
  }

  let sessionId = input.sessionId?.trim() || undefined;

  if (sessionId) {
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

    sessionId = academicSession.id;
  }

  let expiresAt: Date | undefined;

  if (input.expiresAt) {
    const parsedDate = new Date(
      `${input.expiresAt}T23:59:59.999Z`,
    );

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Invalid expiry date.");
    }

    expiresAt = parsedDate;
  }

  const publishNow = input.publishNow ?? true;

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      priority: input.priority ?? "NORMAL",
      audience: input.audience ?? "ALL",
      status: publishNow ? "PUBLISHED" : "DRAFT",
      publishedAt: publishNow ? new Date() : null,
      expiresAt,
      schoolId: session.user.schoolId,
      sessionId,
      createdById: session.user.id,
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      audience: true,
      publishedAt: true,
      expiresAt: true,
    },
  });

  return announcement;
}
