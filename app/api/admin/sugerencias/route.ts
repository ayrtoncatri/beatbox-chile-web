import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { Prisma , SuggestionStatus } from "@prisma/client";

function parseDate(value?: string) {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function GET(req: Request) {
  await ensureAdminApi();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || undefined;
  const estado = searchParams.get("estado") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const from = parseDate(searchParams.get("from") || undefined);
  const to = parseDate(searchParams.get("to") || undefined);

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSizeRaw = Number(searchParams.get("pageSize") || 20);
  const pageSize = Math.min(100, Math.max(1, isNaN(pageSizeRaw) ? 20 : pageSizeRaw));

  const isValidStatus = estado && Object.values(SuggestionStatus).includes(estado as SuggestionStatus);

  const where: Prisma.SugerenciaWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { mensaje: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              // CAMBIO: Buscar en el perfil anidado
              { user: { profile: { nombres: { contains: q, mode: "insensitive" } } } },
              { user: { profile: { apellidoPaterno: { contains: q, mode: "insensitive" } } } },
              { user: { profile: { apellidoMaterno: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {},
      isValidStatus ? { estado: estado as SuggestionStatus } : {},
      userId ? { userId } : {},
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

  const [total, rows, agg] = await Promise.all([
    prisma.sugerencia.count({ where }),
    prisma.sugerencia.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        mensaje: true,
        estado: true,
        createdAt: true,
        user: { 
          select: { 
            id: true, 
            email: true,
            profile: {
              select: {
                nombres: true,
                apellidoPaterno: true
              }
            }
          } 
        },
      },
    }),
    prisma.sugerencia.groupBy({
      by: ["estado"],
      _count: { _all: true },
      where,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const resumenPorEstado = agg.reduce((acc, curr) => {
    acc[curr.estado] = curr._count._all;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    data: rows,
    pagination: { total, page, pageSize, totalPages },
    resumenPorEstado,
  });
}