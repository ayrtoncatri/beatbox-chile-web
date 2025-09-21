-- AlterTable
ALTER TABLE "public"."Sugerencia" ADD COLUMN     "asunto" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'nuevo',
ADD COLUMN     "nombre" TEXT,
ADD COLUMN     "notaPrivada" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
