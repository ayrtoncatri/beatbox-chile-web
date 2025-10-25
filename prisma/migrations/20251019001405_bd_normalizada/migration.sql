/*
  Warnings:

  - You are about to drop the column `ciudad` on the `Evento` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `Evento` table. All the data in the column will be lost.
  - You are about to drop the column `imagen` on the `Evento` table. All the data in the column will be lost.
  - You are about to drop the column `lugar` on the `Evento` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Evento` table. All the data in the column will be lost.
  - The `estado` column on the `Sugerencia` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `apellidoMaterno` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `apellidoPaterno` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `comuna` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `edad` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nombres` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CompraEntrada` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Estadistica` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,eventoId]` on the table `Wildcard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."SuggestionStatus" AS ENUM ('nuevo', 'en_progreso', 'resuelta', 'descartada');

-- DropForeignKey
ALTER TABLE "public"."CompraEntrada" DROP CONSTRAINT "CompraEntrada_eventoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompraEntrada" DROP CONSTRAINT "CompraEntrada_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Estadistica" DROP CONSTRAINT "Estadistica_eventoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Estadistica" DROP CONSTRAINT "Estadistica_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Wildcard" DROP CONSTRAINT "Wildcard_eventoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Wildcard" DROP CONSTRAINT "Wildcard_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Evento" DROP COLUMN "ciudad",
DROP COLUMN "direccion",
DROP COLUMN "imagen",
DROP COLUMN "lugar",
DROP COLUMN "tipo",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "tipoId" TEXT,
ADD COLUMN     "venueId" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Mensaje" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Sugerencia" DROP COLUMN "estado",
ADD COLUMN     "estado" "public"."SuggestionStatus" NOT NULL DEFAULT 'nuevo',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "apellidoMaterno",
DROP COLUMN "apellidoPaterno",
DROP COLUMN "comuna",
DROP COLUMN "edad",
DROP COLUMN "nombres",
DROP COLUMN "region",
DROP COLUMN "role",
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Wildcard" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."CompraEntrada";

-- DropTable
DROP TABLE "public"."Estadistica";

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Region" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comuna" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "Comuna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" TEXT NOT NULL,
    "street" TEXT,
    "reference" TEXT,
    "comunaId" INTEGER,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressId" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "userId" TEXT NOT NULL,
    "nombres" TEXT,
    "apellidoPaterno" TEXT,
    "apellidoMaterno" TEXT,
    "birthDate" TIMESTAMP(3),
    "comunaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "public"."Puntaje" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL,
    "detalle" TEXT,

    CONSTRAINT "Puntaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TicketType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "capacity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Compra" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventoId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pagada',
    "total" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompraItem" (
    "id" TEXT NOT NULL,
    "compraId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompraItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "public"."Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventType_name_key" ON "public"."EventType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "public"."Region"("name");

-- CreateIndex
CREATE INDEX "Comuna_regionId_idx" ON "public"."Comuna"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Comuna_name_regionId_key" ON "public"."Comuna"("name", "regionId");

-- CreateIndex
CREATE INDEX "UserProfile_comunaId_idx" ON "public"."UserProfile"("comunaId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "public"."UserRole"("roleId");

-- CreateIndex
CREATE INDEX "Puntaje_eventoId_idx" ON "public"."Puntaje"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "Puntaje_userId_eventoId_key" ON "public"."Puntaje"("userId", "eventoId");

-- CreateIndex
CREATE INDEX "TicketType_eventId_idx" ON "public"."TicketType"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketType_eventId_name_key" ON "public"."TicketType"("eventId", "name");

-- CreateIndex
CREATE INDEX "Compra_userId_idx" ON "public"."Compra"("userId");

-- CreateIndex
CREATE INDEX "Compra_eventoId_idx" ON "public"."Compra"("eventoId");

-- CreateIndex
CREATE INDEX "CompraItem_compraId_idx" ON "public"."CompraItem"("compraId");

-- CreateIndex
CREATE INDEX "CompraItem_ticketTypeId_idx" ON "public"."CompraItem"("ticketTypeId");

-- CreateIndex
CREATE INDEX "Evento_fecha_idx" ON "public"."Evento"("fecha");

-- CreateIndex
CREATE INDEX "Evento_tipoId_idx" ON "public"."Evento"("tipoId");

-- CreateIndex
CREATE INDEX "Evento_venueId_idx" ON "public"."Evento"("venueId");

-- CreateIndex
CREATE INDEX "Sugerencia_estado_idx" ON "public"."Sugerencia"("estado");

-- CreateIndex
CREATE INDEX "Sugerencia_userId_idx" ON "public"."Sugerencia"("userId");

-- CreateIndex
CREATE INDEX "Wildcard_eventoId_idx" ON "public"."Wildcard"("eventoId");

-- CreateIndex
CREATE INDEX "Wildcard_reviewedById_idx" ON "public"."Wildcard"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "Wildcard_userId_eventoId_key" ON "public"."Wildcard"("userId", "eventoId");

-- AddForeignKey
ALTER TABLE "public"."Comuna" ADD CONSTRAINT "Comuna_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "public"."Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_comunaId_fkey" FOREIGN KEY ("comunaId") REFERENCES "public"."Comuna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Venue" ADD CONSTRAINT "Venue_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_comunaId_fkey" FOREIGN KEY ("comunaId") REFERENCES "public"."Comuna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evento" ADD CONSTRAINT "Evento_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "public"."EventType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evento" ADD CONSTRAINT "Evento_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wildcard" ADD CONSTRAINT "Wildcard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wildcard" ADD CONSTRAINT "Wildcard_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Puntaje" ADD CONSTRAINT "Puntaje_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Puntaje" ADD CONSTRAINT "Puntaje_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TicketType" ADD CONSTRAINT "TicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Compra" ADD CONSTRAINT "Compra_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Compra" ADD CONSTRAINT "Compra_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompraItem" ADD CONSTRAINT "CompraItem_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "public"."Compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompraItem" ADD CONSTRAINT "CompraItem_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "public"."TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mensaje" ADD CONSTRAINT "Mensaje_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
