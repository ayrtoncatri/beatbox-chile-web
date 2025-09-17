/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "name",
ADD COLUMN     "apellidoMaterno" TEXT,
ADD COLUMN     "apellidoPaterno" TEXT,
ADD COLUMN     "comuna" TEXT,
ADD COLUMN     "edad" INTEGER,
ADD COLUMN     "nombres" TEXT,
ADD COLUMN     "region" TEXT;
