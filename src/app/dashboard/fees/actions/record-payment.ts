"use server";

import crypto from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function generateReceiptNo() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `BSIA-${timestamp}-${random}`;
}

export async function recordPayment(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    throw new Error(
      "Only administrators and principals can record payments.",
    );
  }

  const studentFeeId = String(
    formData.get("studentFeeId") ?? "",
  ).trim();

  const amountValue = String(
    formData.get("amount") ?? "",
  ).trim();

  const method = String(
    formData.get("method") ?? "",
  ).trim();

  const reference = String(
    formData.get("reference") ?? "",
  ).trim();

  const notes = String(
    formData.get("notes") ?? "",
  ).trim();

  if (!studentFeeId) {
    throw new Error("Student fee is required.");
  }

  const amount = Number(amountValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const allowedMethods = [
    "CASH",
    "BANK_TRANSFER",
    "POS",
    "ONLINE",
    "OTHER",
  ] as const;

  if (!allowedMethods.includes(method as (typeof allowedMethods)[number])) {
    throw new Error("Invalid payment method.");
  }

  const studentFee = await prisma.studentFee.findFirst({
    where: {
      id: studentFeeId,
      student: {
        schoolId: session.user.schoolId,
      },
      feeStructure: {
        schoolId: session.user.schoolId,
      },
    },
    select: {
      id: true,
      amountDue: true,
      amountPaid: true,
      status: true,
    },
  });

  if (!studentFee) {
    throw new Error("Student fee not found.");
  }

  if (studentFee.status === "PAID") {
    throw new Error("This student fee has already been fully paid.");
  }

  const amountDue = Number(studentFee.amountDue);
  const amountPaid = Number(studentFee.amountPaid);
  const outstanding = amountDue - amountPaid;

  if (amount > outstanding) {
    throw new Error(
      `Payment exceeds the outstanding balance of ₦${outstanding.toFixed(2)}.`,
    );
  }

  const newAmountPaid = amountPaid + amount;

  const newStatus =
    newAmountPaid >= amountDue ? "PAID" : "PARTIAL";

  let receiptNo = generateReceiptNo();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existingReceipt = await prisma.payment.findUnique({
      where: {
        receiptNo,
      },
      select: {
        id: true,
      },
    });

    if (!existingReceipt) {
      break;
    }

    receiptNo = generateReceiptNo();
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        receiptNo,
        amount,
        method: method as
          | "CASH"
          | "BANK_TRANSFER"
          | "POS"
          | "ONLINE"
          | "OTHER",
        status: "PAID",
        reference: reference || null,
        notes: notes || null,
        studentFeeId: studentFee.id,
        recordedById: session.user.id,
      },
    });

    await tx.studentFee.update({
      where: {
        id: studentFee.id,
      },
      data: {
        amountPaid: newAmountPaid,
        status: newStatus,
      },
    });

    return payment;
  });

  return {
    id: result.id,
    receiptNo: result.receiptNo,
    amount: Number(result.amount),
    status: newStatus,
  };
}
