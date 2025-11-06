/*
  Warnings:

  - A unique constraint covering the columns `[eventoId,categoriaId,phase,judgeId,participantId,roundNumber]` on the table `Score` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Score_eventoId_categoriaId_phase_judgeId_participantId_key";

-- AlterTable
ALTER TABLE "public"."Score" ADD COLUMN     "battleId" TEXT,
ADD COLUMN     "roundNumber" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."Battle" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "phase" "public"."RoundPhase" NOT NULL,
    "orderInRound" INTEGER NOT NULL DEFAULT 1,
    "participantAId" TEXT NOT NULL,
    "participantBId" TEXT,
    "winnerId" TEXT,
    "nextBattleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Battle_nextBattleId_key" ON "public"."Battle"("nextBattleId");

-- CreateIndex
CREATE INDEX "Battle_eventoId_idx" ON "public"."Battle"("eventoId");

-- CreateIndex
CREATE INDEX "Battle_participantAId_idx" ON "public"."Battle"("participantAId");

-- CreateIndex
CREATE INDEX "Battle_participantBId_idx" ON "public"."Battle"("participantBId");

-- CreateIndex
CREATE INDEX "Battle_winnerId_idx" ON "public"."Battle"("winnerId");

-- CreateIndex
CREATE INDEX "Score_battleId_idx" ON "public"."Score"("battleId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_eventoId_categoriaId_phase_judgeId_participantId_roun_key" ON "public"."Score"("eventoId", "categoriaId", "phase", "judgeId", "participantId", "roundNumber");

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "public"."Battle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Battle" ADD CONSTRAINT "Battle_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Battle" ADD CONSTRAINT "Battle_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Battle" ADD CONSTRAINT "Battle_participantAId_fkey" FOREIGN KEY ("participantAId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Battle" ADD CONSTRAINT "Battle_participantBId_fkey" FOREIGN KEY ("participantBId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Battle" ADD CONSTRAINT "Battle_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Battle" ADD CONSTRAINT "Battle_nextBattleId_fkey" FOREIGN KEY ("nextBattleId") REFERENCES "public"."Battle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
