import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { PublicationStatus, PublicationType } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  titulo: z.string().trim().min(1).max(200).optional(),
  descripcion: z.string().trim().max(4000).nullable().optional(),
  tipo: z.nativeEnum(PublicationType).optional(),
  fecha: z.string().min(1).optional(),
  estado: z.nativeEnum(PublicationStatus).optional(),
  url: z.string().url().nullable().optional(),
  autor: z.string().trim().min(1).max(120).optional(),
  imagenes: z.array(z.string().url()).optional(),
});

function getIdFromRequest(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/");
  return segments[segments.length - 1];
}

export async function GET(req: NextRequest) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const item = await prisma.publicacion.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ data: item }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const data: Record<string, unknown> = {
    ...(d.titulo !== undefined ? { titulo: d.titulo } : {}),
    ...(d.descripcion !== undefined ? { descripcion: d.descripcion } : {}),
    ...(d.tipo !== undefined ? { tipo: d.tipo } : {}),
    ...(d.fecha !== undefined ? { fecha: new Date(d.fecha) } : {}),
    ...(d.estado !== undefined ? { estado: d.estado } : {}),
    ...(d.url !== undefined ? { url: d.url } : {}),
    ...(d.autor !== undefined ? { autor: d.autor } : {}),
    ...(d.imagenes !== undefined ? { imagenes: d.imagenes } : {}),
  };

  const updated = await prisma.publicacion.update({
    where: { id },
    data,
    select: { id: true },
  });

  return NextResponse.json({ data: updated }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.publicacion.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
