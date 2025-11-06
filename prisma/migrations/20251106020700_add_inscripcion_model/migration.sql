-- CreateEnum
CREATE TYPE "public"."InscripcionSource" AS ENUM ('WILDCARD', 'LIGA_ADMIN', 'CN_ADMIN', 'CN_HISTORICO_TOP3', 'LIGA_PRESENCIAL_TOP3', 'LIGA_ONLINE_TOP3');

-- CreateTable
CREATE TABLE "public"."Inscripcion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "source" "public"."InscripcionSource" NOT NULL,
    "nombreArtistico" TEXT,
    "wildcardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_wildcardId_key" ON "public"."Inscripcion"("wildcardId");

-- CreateIndex
CREATE INDEX "Inscripcion_userId_idx" ON "public"."Inscripcion"("userId");

-- CreateIndex
CREATE INDEX "Inscripcion_eventoId_idx" ON "public"."Inscripcion"("eventoId");

-- CreateIndex
CREATE INDEX "Inscripcion_categoriaId_idx" ON "public"."Inscripcion"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_userId_eventoId_categoriaId_key" ON "public"."Inscripcion"("userId", "eventoId", "categoriaId");

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_wildcardId_fkey" FOREIGN KEY ("wildcardId") REFERENCES "public"."Wildcard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
