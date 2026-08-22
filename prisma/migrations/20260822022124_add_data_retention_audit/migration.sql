-- CreateTable
CREATE TABLE "DataRetentionRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "result" JSONB,
    "error" TEXT,

    CONSTRAINT "DataRetentionRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataRetentionRun_startedAt_idx" ON "DataRetentionRun"("startedAt");
