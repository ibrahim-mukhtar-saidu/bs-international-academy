import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import type { UserRole } from "@/generated/prisma/client";

interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  schoolId: string;
}

export async function createUser(input: CreateUserInput) {
  const email = input.email.trim().toLowerCase();

  if (!email || !input.password || !input.firstName || !input.lastName) {
    throw new Error("Required user information is missing");
  }

  if (input.password.length < 8) {
    throw new Error("Password must contain at least 8 characters");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim() || null,
      role: input.role,
      schoolId: input.schoolId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      schoolId: true,
      createdAt: true,
    },
  });
}
