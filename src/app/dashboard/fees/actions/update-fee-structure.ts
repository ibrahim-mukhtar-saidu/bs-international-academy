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

export async function updateFeeStructure(
  feeId: string,
  formData: FormData,
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
      "Only administrators and principals can update fee structures.",
    );
  }

  if (!feeId) {
    throw new Error("Fee structure ID is required.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const feeTypeValue = String(formData.get("feeType") ?? "").trim();
  const amountValue = String(formData.get("amount") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isActive = formData.get("isActive") === "true";

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

  const existingFee = await prisma.feeStructure.findFirst({
    where: {
      id: feeId,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!existingFee) {
    throw new Error("Fee structure not found.");
  }

  const feeStructure = await prisma.feeStructure.update({
    where: {
      id: feeId,
    },
    data: {
      name,
      feeType: feeTypeValue as FeeType,
      amount,
      description: description || null,
      isActive,
    },
  });

  return {
    id: feeStructure.id,
    name: feeStructure.name,
    isActive: feeStructure.isActive,
  };
}
