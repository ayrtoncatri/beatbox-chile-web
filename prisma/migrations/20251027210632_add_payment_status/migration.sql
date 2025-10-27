/*
  Warnings:

  - The `status` column on the `Compra` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pendiente', 'pagada', 'fallida', 'reembolsada');

-- AlterTable
ALTER TABLE "public"."Compra" DROP COLUMN "status",
ADD COLUMN     "status" "public"."PaymentStatus" NOT NULL DEFAULT 'pendiente';
