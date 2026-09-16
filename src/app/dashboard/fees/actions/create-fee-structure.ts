"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const allowedFeeTypes = [
  "TUITION",
  "REGISTRATION",
  "EXAMINATION",
  "DEVELOPMENT",
  "TRANSPORT",
  "UNIFORM",
  "BOOKS",
  "OTHER",
] as const;

type FeeType = (typeof allowedFeeTypes)[number];

export async function createFeeStructure(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    throw new Error(
      "Only administrators and principals can create fee structures.",
    );
  }

  const name = String(formData.get("name") ?? "").trim();
  const feeTypeValue = String(formData.get("feeType") ?? "").trim();
  const amountValue = String(formData.get("amount") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    throw new Error("Fee name is required.");
  }

  if (!allowedFeeTypes.includes(feeTypeValue as FeeType)) {
    throw new Error("Invalid fee type.");
  }

  const amount = Number(amountValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Fee amount must be greater than zero.");
  }

  const feeStructure = await prisma.feeStructure.create({
    data: {
      name,
      feeType: feeTypeValue as FeeType,
      amount,
      description: description || null,
      schoolId: session.user.schoolId,
    },
  });

  return {
    id: feeStructure.id,
    name: feeStructure.name,
  };
}
