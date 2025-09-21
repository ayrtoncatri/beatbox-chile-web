import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import type { Prisma } from "@prisma/client";

function parseDate(value?: string) {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function GET(req: Request) {
  await ensureAdminApi();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || undefined;
  const eventId = searchParams.get("eventId") || undefined;
  const tipo = searchParams.get("tipo") as "General" | "VIP" | null;
  const from = parseDate(searchParams.get("from") || undefined);
  const to = parseDate(searchParams.get("to") || undefined);

  const where: Prisma.CompraEntradaWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { userNombre: { contains: q, mode: "insensitive" } },
              { userEmail: { contains: q, mode: "insensitive" } },
              { eventoNombre: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      eventId ? { eventoId: eventId } : {},
      tipo ? { tipoEntrada: tipo } : {},
      from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {},
    ],
  };

  const rows = await prisma.compraEntrada.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10000,
    select: {
      createdAt: true,
      eventoNombre: true,
      eventoFecha: true,
      userNombre: true,
      userEmail: true,
      tipoEntrada: true,
      cantidad: true,
      precioUnitario: true,
      total: true,
    },
  });

  const header = [
    "fechaCompra",
    "evento",
    "fechaEvento",
    "comprador",
    "email",
    "tipoEntrada",
    "cantidad",
    "precioUnitario",
    "total",
  ].join(";");

  const csvLines = rows.map((r) =>
    [
      r.createdAt.toISOString(),
      r.eventoNombre,
      r.eventoFecha.toISOString(),
      r.userNombre,
      r.userEmail,
      r.tipoEntrada,
      r.cantidad,
      r.precioUnitario,
      r.total,
    ]
      .map((v) => String(v).replaceAll(/[\r\n]+/g, " ").replaceAll(";", ","))
      .join(";")
  );

  const now = new Date();
  const fecha = now.toLocaleDateString("es-CL").replace(/\//g, "-");
  const hora = now.toLocaleTimeString("es-CL").replace(/:/g, "-").replace(/\s/g, "");
  const filename = `Reporte de compras ${fecha} ${hora}.csv`;

  const csv = "\uFEFF" + [header, ...csvLines].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}