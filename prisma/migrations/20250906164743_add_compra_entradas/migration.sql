-- CreateTable
CREATE TABLE "CompraEntrada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userNombre" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "eventoNombre" TEXT NOT NULL,
    "eventoFecha" DATETIME NOT NULL,
    "tipoEntrada" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompraEntrada_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompraEntrada_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
