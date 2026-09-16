"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type AnnouncementAction = "PUBLISH" | "ARCHIVE" | "DELETE";

interface ManageAnnouncementInput {
  announcementId: string;
  action: AnnouncementAction;
}

export async function manageAnnouncement(
  input: ManageAnnouncementInput,
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
      "Only administrators and principals can manage announcements.",
    );
  }

  const announcementId = input.announcementId.trim();

  if (!announcementId) {
    throw new Error("Announcement ID is required.");
  }

  const announcement = await prisma.announcement.findFirst({
    where: {
      id: announcementId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!announcement) {
    throw new Error("Announcement not found.");
  }

  if (input.action === "PUBLISH") {
    if (announcement.status === "PUBLISHED") {
      throw new Error("Announcement is already published.");
    }

    if (announcement.status === "ARCHIVED") {
      throw new Error(
        "Archived announcements cannot be published.",
      );
    }

    return prisma.announcement.update({
      where: {
        id: announcement.id,
      },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        publishedAt: true,
      },
    });
  }

  if (input.action === "ARCHIVE") {
    if (announcement.status === "ARCHIVED") {
      throw new Error("Announcement is already archived.");
    }

    return prisma.announcement.update({
      where: {
        id: announcement.id,
      },
      data: {
        status: "ARCHIVED",
      },
      select: {
        id: true,
        status: true,
      },
    });
  }

  if (input.action === "DELETE") {
    await prisma.announcement.delete({
      where: {
        id: announcement.id,
      },
    });

    return {
      id: announcement.id,
      deleted: true,
    };
  }

  throw new Error("Unsupported announcement action.");
}
