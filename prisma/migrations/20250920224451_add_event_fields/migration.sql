-- AlterTable
ALTER TABLE "public"."Evento" ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "imagen" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTicketed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lugar" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
