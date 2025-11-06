/*
  Warnings:

  - You are about to drop the column `categoria` on the `Wildcard` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,eventoId,categoriaId]` on the table `Wildcard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoriaId` to the `Wildcard` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."RoundPhase" AS ENUM ('WILDCARD', 'PRELIMINAR', 'OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'TERCER_LUGAR', 'FINAL');

-- CreateEnum
CREATE TYPE "public"."ScoreStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- DropIndex
DROP INDEX "public"."Wildcard_userId_eventoId_key";

-- AlterTable
ALTER TABLE "public"."Evento" ADD COLUMN     "asistencia" INTEGER DEFAULT 0,
ADD COLUMN     "premios" TEXT,
ADD COLUMN     "sponsors" TEXT;

-- AlterTable
ALTER TABLE "public"."Wildcard" DROP COLUMN "categoria",
ADD COLUMN     "categoriaId" TEXT NOT NULL,
ADD COLUMN     "isClassified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."Categoria" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Criterio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minScore" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL,
    "categoriaId" TEXT NOT NULL,

    CONSTRAINT "Criterio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompetitionCategory" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "wildcardSlots" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompetitionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JudgeAssignment" (
    "id" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "phase" "public"."RoundPhase" NOT NULL,

    CONSTRAINT "JudgeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Score" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "phase" "public"."RoundPhase" NOT NULL,
    "judgeId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status" "public"."ScoreStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScoreDetail" (
    "id" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "criterioId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "ScoreDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_name_key" ON "public"."Categoria"("name");

-- CreateIndex
CREATE INDEX "Criterio_categoriaId_idx" ON "public"."Criterio"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Criterio_name_categoriaId_key" ON "public"."Criterio"("name", "categoriaId");

-- CreateIndex
CREATE INDEX "CompetitionCategory_categoriaId_idx" ON "public"."CompetitionCategory"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionCategory_eventoId_categoriaId_key" ON "public"."CompetitionCategory"("eventoId", "categoriaId");

-- CreateIndex
CREATE INDEX "JudgeAssignment_eventoId_idx" ON "public"."JudgeAssignment"("eventoId");

-- CreateIndex
CREATE INDEX "JudgeAssignment_judgeId_idx" ON "public"."JudgeAssignment"("judgeId");

-- CreateIndex
CREATE UNIQUE INDEX "JudgeAssignment_judgeId_eventoId_categoriaId_phase_key" ON "public"."JudgeAssignment"("judgeId", "eventoId", "categoriaId", "phase");

-- CreateIndex
CREATE INDEX "Score_eventoId_categoriaId_phase_idx" ON "public"."Score"("eventoId", "categoriaId", "phase");

-- CreateIndex
CREATE INDEX "Score_judgeId_idx" ON "public"."Score"("judgeId");

-- CreateIndex
CREATE INDEX "Score_participantId_idx" ON "public"."Score"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_eventoId_categoriaId_phase_judgeId_participantId_key" ON "public"."Score"("eventoId", "categoriaId", "phase", "judgeId", "participantId");

-- CreateIndex
CREATE INDEX "ScoreDetail_criterioId_idx" ON "public"."ScoreDetail"("criterioId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreDetail_scoreId_criterioId_key" ON "public"."ScoreDetail"("scoreId", "criterioId");

-- CreateIndex
CREATE INDEX "Wildcard_categoriaId_idx" ON "public"."Wildcard"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Wildcard_userId_eventoId_categoriaId_key" ON "public"."Wildcard"("userId", "eventoId", "categoriaId");

-- AddForeignKey
ALTER TABLE "public"."Criterio" ADD CONSTRAINT "Criterio_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wildcard" ADD CONSTRAINT "Wildcard_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetitionCategory" ADD CONSTRAINT "CompetitionCategory_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetitionCategory" ADD CONSTRAINT "CompetitionCategory_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JudgeAssignment" ADD CONSTRAINT "JudgeAssignment_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JudgeAssignment" ADD CONSTRAINT "JudgeAssignment_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JudgeAssignment" ADD CONSTRAINT "JudgeAssignment_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScoreDetail" ADD CONSTRAINT "ScoreDetail_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "public"."Score"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScoreDetail" ADD CONSTRAINT "ScoreDetail_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "public"."Criterio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
