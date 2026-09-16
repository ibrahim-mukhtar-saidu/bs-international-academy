-- CreateEnum
CREATE TYPE "ScratchCardStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'DISABLED');

-- CreateTable
CREATE TABLE "ScratchCard" (
    "id" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "status" "ScratchCardStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT,

    CONSTRAINT "ScratchCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScratchCard_serial_key" ON "ScratchCard"("serial");

-- CreateIndex
CREATE INDEX "ScratchCard_schoolId_idx" ON "ScratchCard"("schoolId");

-- CreateIndex
CREATE INDEX "ScratchCard_studentId_idx" ON "ScratchCard"("studentId");

-- CreateIndex
CREATE INDEX "ScratchCard_status_idx" ON "ScratchCard"("status");

-- CreateIndex
CREATE INDEX "ScratchCard_expiresAt_idx" ON "ScratchCard"("expiresAt");

-- AddForeignKey
ALTER TABLE "ScratchCard" ADD CONSTRAINT "ScratchCard_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScratchCard" ADD CONSTRAINT "ScratchCard_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
