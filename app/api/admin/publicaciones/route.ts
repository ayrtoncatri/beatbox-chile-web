import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { PublicationStatus, PublicationType, Prisma } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  titulo: z.string().trim().min(1).max(200),
  descripcion: z.string().trim().max(4000).optional().nullable(),
  tipo: z.nativeEnum(PublicationType),
  fecha: z.string().min(1),
  estado: z.nativeEnum(PublicationStatus).optional().default(PublicationStatus.borrador),
  url: z.string().url().optional().nullable(),
  autor: z.string().trim().min(1).max(120),
  imagenes: z.array(z.string().url()).optional().default([]),
});

export async function GET(req: Request) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const tipo = (searchParams.get("tipo") || "all") as "all" | PublicationType;
  const estado = (searchParams.get("estado") || "all") as "all" | PublicationStatus;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const skip = (page - 1) * pageSize;

  const where: Prisma.PublicacionWhereInput = {};
  if (q) {
    where.OR = [
      { titulo: { contains: q, mode: "insensitive" } },
      { descripcion: { contains: q, mode: "insensitive" } },
      { autor: { contains: q, mode: "insensitive" } },
    ];
  }
  if (tipo !== "all") where.tipo = tipo;
  if (estado !== "all") where.estado = estado;

  const [total, items] = await Promise.all([
    prisma.publicacion.count({ where }),
    prisma.publicacion.findMany({
      where,
      orderBy: [{ fecha: "desc" }],
      skip,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    data: items,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(req: Request) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const fechaDate = new Date(d.fecha);
  if (isNaN(+fechaDate)) {
    return NextResponse.json({ error: "Fecha invalida" }, { status: 400 });
  }

  const created = await prisma.publicacion.create({
    data: {
      titulo: d.titulo,
      descripcion: d.descripcion ?? null,
      tipo: d.tipo,
      fecha: fechaDate,
      estado: d.estado ?? PublicationStatus.borrador,
      url: d.url ?? null,
      autor: d.autor,
      imagenes: d.imagenes ?? [],
    },
    select: { id: true },
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
