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

  const isValidStatus = estado && Object.values(SuggestionStatus).includes(estado as SuggestionStatus);

  const where: Prisma.SugerenciaWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { user: { email: { contains: q, mode: "insensitive" } } },
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

  const rows = await prisma.sugerencia.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10000,
    select: {
      createdAt: true,
      mensaje: true,
      estado: true,
      user: { 
        select: { 
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
  });

  const header = [
    "fecha",
    "usuario",
    "email",
    "estado",
    "mensaje",
  ].join(";");

  const csvLines = rows.map((r) => {
    const userName = r.user 
      ? [r.user.profile?.nombres, r.user.profile?.apellidoPaterno].filter(Boolean).join(" ")
      : "";

    return [
      r.createdAt.toISOString(),
      userName,
      r.user?.email || "",
      r.estado,
      (r.mensaje || "").replaceAll(/[\r\n]+/g, " ").replaceAll(";", ","),
    ].join(";");
  });

  const now = new Date();
  const fecha = now.toLocaleDateString("es-CL").replace(/\//g, "-");
  const hora = now.toLocaleTimeString("es-CL").replace(/:/g, "-").replace(/\s/g, "");
  const filename = `Reporte de sugerencias ${fecha} ${hora}.csv`;

  const csv = "\uFEFF" + [header, ...csvLines].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}