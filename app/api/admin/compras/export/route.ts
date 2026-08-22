import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { ensureAdminApi } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { pseudonymizeValue } from "@/lib/privacy/pseudonym";

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
  const from = parseDate(searchParams.get("from") || undefined);
  const to = parseDate(searchParams.get("to") || undefined);
  const raw = searchParams.get("raw") === "1";

  const where: Prisma.CompraWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { user: { email: { contains: q, mode: "insensitive" } } },
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { profile: { nombres: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {},
      eventId ? { eventoId: eventId } : {},
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

  const rows = await prisma.compra.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10000,
    select: {
      createdAt: true,
      total: true,
      status: true,
      evento: { select: { nombre: true, fecha: true } },
      user: {
        select: {
          email: true,
          name: true,
          profile: { select: { nombres: true, apellidoPaterno: true } },
        },
      },
      items: {
        select: {
          quantity: true,
          unitPrice: true,
          subtotal: true,
          ticketType: { select: { name: true } },
        },
      },
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
    "status",
  ].join(";");

  const csvLines = rows.flatMap((r) => {
    const comprador =
      [r.user.profile?.nombres, r.user.profile?.apellidoPaterno].filter(Boolean).join(" ")
      || r.user.name
      || "";
    const email = r.user.email;
    const base = [
      r.createdAt.toISOString(),
      r.evento?.nombre ?? "",
      r.evento?.fecha?.toISOString() ?? "",
      raw ? comprador : pseudonymizeValue(comprador, "name"),
      raw ? email : pseudonymizeValue(email, "email"),
    ];

    if (r.items.length === 0) {
      return [[...base, "", "", "", r.total, r.status].join(";")];
    }

    return r.items.map((item) =>
      [
        ...base,
        item.ticketType.name,
        item.quantity,
        item.unitPrice,
        item.subtotal,
        r.status,
      ]
        .map((v) => String(v).replaceAll(/[\r\n]+/g, " ").replaceAll(";", ","))
        .join(";"),
    );
  });

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
