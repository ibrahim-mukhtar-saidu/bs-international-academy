"use server";

import crypto from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

function generateSerial() {
  return `BSIA-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

function generatePin() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function createScratchCard() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL") {
    throw new Error("Only administrators and principals can create scratch cards.");
  }

  const serial = generateSerial();
  const pin = generatePin();
  const pinHash = await hashPassword(pin);

  const card = await prisma.scratchCard.create({
    data: {
      serial,
      pinHash,
      schoolId: session.user.schoolId,
    },
  });

  return {
    id: card.id,
    serial: card.serial,
    pin,
    status: card.status,
  };
}
