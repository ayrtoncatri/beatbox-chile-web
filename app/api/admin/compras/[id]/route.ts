import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await ensureAdminApi();
  const compra = await prisma.compraEntrada.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      createdAt: true,
      userNombre: true,
      userEmail: true,
      eventoId: true,
      eventoNombre: true,
      eventoFecha: true,
      tipoEntrada: true,
      cantidad: true,
      precioUnitario: true,
      total: true,
    },
  });
  if (!compra) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(compra);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await ensureAdminApi();
  await prisma.compraEntrada.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}