// En: app/api/admin/compras/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import type { Prisma } from "@prisma/client";

function parseDate(value?: string) {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

// Este tipo define la fila PLANA que espera el frontend
type CompraRow = {
  id: string;
  createdAt: Date;
  userNombre: string | null;
  userEmail: string;
  eventoId: string;
  eventoNombre: string;
  eventoFecha: Date;
  tipoEntrada: string;
  cantidad: number; // El frontend espera 'cantidad'
  precioUnitario: number;
  total: number;
};

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

  const orderBy: Prisma.CompraItemOrderByWithRelationInput =
    sort === "fecha_asc"
      ? { createdAt: "asc" }
      : sort === "total_desc"
      ? { subtotal: "desc" }
      : sort === "total_asc"
      ? { subtotal: "asc" }
      : { createdAt: "desc" };

  const where: Prisma.CompraItemWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { compra: { user: { email: { contains: q, mode: "insensitive" } } } },
              { compra: { user: { profile: { nombres: { contains: q, mode: "insensitive" } } } } },
              { ticketType: { event: { nombre: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {},
      eventId ? { ticketType: { eventId: eventId } } : {},
      tipo ? { ticketType: { name: tipo } } : {},
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

  const [total, rowsRaw, agg, aggGeneral, aggVip] = await Promise.all([
    prisma.compraItem.count({ where }),
    prisma.compraItem.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        compra: {
          include: {
            user: {
              select: {
                email: true,
                profile: { select: { nombres: true, apellidoPaterno: true } }
              }
            }
          }
        },
        ticketType: {
          include: {
            event: {
              select: { id: true, nombre: true, fecha: true }
            }
          }
        }
      }
    }),
    // CORRECCIÓN 1: Usar 'quantity' (del schema) en lugar de 'cantidad'
    prisma.compraItem.aggregate({
      where,
      _sum: { quantity: true, subtotal: true }, // <-- CAMBIO AQUÍ
      _count: { _all: true },
    }),
    // CORRECCIÓN 2: Usar 'quantity' (del schema) en lugar de 'cantidad'
    prisma.compraItem.aggregate({
      where: { AND: [where, { ticketType: { name: "General" } }] },
      _sum: { quantity: true, subtotal: true }, // <-- CAMBIO AQUÍ
    }),
    // CORRECCIÓN 3: Usar 'quantity' (del schema) en lugar de 'cantidad'
    prisma.compraItem.aggregate({
      where: { AND: [where, { ticketType: { name: "VIP" } }] },
      _sum: { quantity: true, subtotal: true }, // <-- CAMBIO AQUÍ
    }),
  ]);

  // Mapeamos los datos anidados a la estructura plana 'CompraRow'
  const rows: CompraRow[] = rowsRaw.map(item => {
    const userNombre = [
      item.compra.user.profile?.nombres, 
      item.compra.user.profile?.apellidoPaterno
    ].filter(Boolean).join(' ');
    
    return {
      id: item.id,
      createdAt: item.createdAt,
      userNombre: userNombre || item.compra.user.email,
      userEmail: item.compra.user.email,
      eventoId: item.ticketType.event.id,
      eventoNombre: item.ticketType.event.nombre,
      eventoFecha: item.ticketType.event.fecha,
      tipoEntrada: item.ticketType.name,
      cantidad: item.quantity, // Mapeamos quantity -> cantidad para el frontend
      precioUnitario: item.unitPrice,
      total: item.subtotal,
    };
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const summary = {
    totalCompras: agg._count?._all || 0,
    // CORRECCIÓN 4: Acceder a 'quantity' del resultado
    entradasVendidas: agg._sum?.quantity || 0, // <-- CAMBIO AQUÍ
    ingresosBrutos: agg._sum?.subtotal || 0,
    porTipo: {
      General: {
        // CORRECCIÓN 5: Acceder a 'quantity' del resultado
        entradas: aggGeneral._sum?.quantity || 0, // <-- CAMBIO AQUÍ
        ingresos: aggGeneral._sum?.subtotal || 0,
      },
      VIP: {
        // CORRECCIÓN 6: Acceder a 'quantity' del resultado
        entradas: aggVip._sum?.quantity || 0, // <-- CAMBIO AQUÍ
        ingresos: aggVip._sum?.subtotal || 0,
      },
    },
  };

  return NextResponse.json({
    data: rows,
    pagination: { total, page, pageSize, totalPages },
    summary,
  });
}