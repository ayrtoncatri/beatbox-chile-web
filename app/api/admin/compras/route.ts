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

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSizeRaw = Number(searchParams.get("pageSize") || 20);
  const pageSize = Math.min(100, Math.max(1, isNaN(pageSizeRaw) ? 20 : pageSizeRaw));

  const sort = (searchParams.get("sort") ||
    "fecha_desc") as "fecha_desc" | "fecha_asc" | "total_desc" | "total_asc";

  const orderBy: Prisma.CompraEntradaOrderByWithRelationInput =
    sort === "fecha_asc"
      ? { createdAt: "asc" }
      : sort === "total_desc"
      ? { total: "desc" }
      : sort === "total_asc"
      ? { total: "asc" }
      : { createdAt: "desc" };

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

  const [total, rows, agg, aggGeneral, aggVip] = await Promise.all([
    prisma.compraEntrada.count({ where }),
    prisma.compraEntrada.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
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
    }),
    prisma.compraEntrada.aggregate({
      where,
      _sum: { cantidad: true, total: true },
      _count: { _all: true },
    }),
    prisma.compraEntrada.aggregate({
      where: { AND: [where, { tipoEntrada: "General" }] },
      _sum: { cantidad: true, total: true },
    }),
    prisma.compraEntrada.aggregate({
      where: { AND: [where, { tipoEntrada: "VIP" }] },
      _sum: { cantidad: true, total: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const summary = {
    totalCompras: agg._count?._all || 0,
    entradasVendidas: agg._sum?.cantidad || 0,
    ingresosBrutos: agg._sum?.total || 0,
    porTipo: {
      General: {
        entradas: aggGeneral._sum?.cantidad || 0,
        ingresos: aggGeneral._sum?.total || 0,
      },
      VIP: {
        entradas: aggVip._sum?.cantidad || 0,
        ingresos: aggVip._sum?.total || 0,
      },
    },
  };

  return NextResponse.json({
    data: rows,
    pagination: { total, page, pageSize, totalPages },
    summary,
  });
}