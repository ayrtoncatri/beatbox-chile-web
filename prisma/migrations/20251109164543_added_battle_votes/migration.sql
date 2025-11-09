-- AlterTable
ALTER TABLE "public"."Battle" ADD COLUMN     "loserVotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "winnerVotes" INTEGER NOT NULL DEFAULT 0;
