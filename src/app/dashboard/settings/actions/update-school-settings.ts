"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface UpdateSchoolSettingsInput {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

export async function updateSchoolSettings(
  input: UpdateSchoolSettingsInput,
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
      "Only administrators and principals can update school settings.",
    );
  }

  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();
  const address = input.address?.trim() || null;
  const phone = input.phone?.trim() || null;
  const email = input.email?.trim().toLowerCase() || null;
  const website = input.website?.trim() || null;
  const logoUrl = input.logoUrl?.trim() || null;

  if (!name) {
    throw new Error("School name is required.");
  }

  if (!code) {
    throw new Error("School code is required.");
  }

  if (email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      throw new Error("Please enter a valid school email address.");
    }
  }

  if (website) {
    try {
      new URL(website);
    } catch {
      throw new Error(
        "Please enter a valid website URL, including https://.",
      );
    }
  }

  if (logoUrl) {
    try {
      new URL(logoUrl);
    } catch {
      throw new Error(
        "Please enter a valid logo URL, including https://.",
      );
    }
  }

  const existingSchool = await prisma.school.findUnique({
    where: {
      id: session.user.schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!existingSchool) {
    throw new Error("School record not found.");
  }

  const duplicateCode = await prisma.school.findFirst({
    where: {
      code,
      NOT: {
        id: session.user.schoolId,
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicateCode) {
    throw new Error("That school code is already in use.");
  }

  const school = await prisma.school.update({
    where: {
      id: session.user.schoolId,
    },
    data: {
      name,
      code,
      address,
      phone,
      email,
      website,
      logoUrl,
    },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      phone: true,
      email: true,
      website: true,
      logoUrl: true,
    },
  });

  return school;
}
