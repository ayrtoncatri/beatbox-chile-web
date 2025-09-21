import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { NextRequest } from "next/server";

function getIdFromRequest(req: NextRequest) {
  // /api/admin/compras/[id]
  const segments = req.nextUrl.pathname.split("/");
  return segments[segments.length - 1];
}

export async function GET(req: NextRequest) {
  await ensureAdminApi();
  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const compra = await prisma.compraEntrada.findUnique({
    where: { id },
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

export async function DELETE(req: NextRequest) {
  await ensureAdminApi();
  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.compraEntrada.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}