import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export async function GET(req: Request) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const status = (searchParams.get("status") || "all").toLowerCase(); // all|published|draft
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const skip = (page - 1) * pageSize;

  const where: Prisma.EventoWhereInput = {};
  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: "insensitive" } },
      { ciudad: { contains: q, mode: "insensitive" } },
      { lugar: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status === "published") where.isPublished = true;
  if (status === "draft") where.isPublished = false;

  const [total, items] = await Promise.all([
    prisma.evento.count({ where }),
    prisma.evento.findMany({
      where,
      orderBy: [{ fecha: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        nombre: true,
        fecha: true,
        ciudad: true,
        lugar: true,
        isPublished: true,
        isTicketed: true,
        imagen: true,
      },
    }),
  ]);

  return NextResponse.json({
    data: items,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

const createSchema = z.object({
  nombre: z.string().trim().min(1).max(200),
  descripcion: z.string().trim().max(4000).optional().nullable(),
  fecha: z.string().min(1), // ISO o datetime-local
  lugar: z.string().trim().max(200).optional().nullable(),
  ciudad: z.string().trim().max(200).optional().nullable(),
  direccion: z.string().trim().max(300).optional().nullable(),
  imagen: z.string().url().max(500).optional().nullable(),
  isPublished: z.boolean().optional().default(false),
  isTicketed: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const created = await prisma.evento.create({
    data: {
      nombre: d.nombre,
      descripcion: d.descripcion ?? null,
      fecha: new Date(d.fecha),
      lugar: d.lugar ?? null,
      ciudad: d.ciudad ?? null,
      direccion: d.direccion ?? null,
      imagen: d.imagen ?? null,
      isPublished: d.isPublished ?? false,
      isTicketed: d.isTicketed ?? true,
    },
    select: { id: true },
  });

  return NextResponse.json({ data: created }, { status: 201 });
}