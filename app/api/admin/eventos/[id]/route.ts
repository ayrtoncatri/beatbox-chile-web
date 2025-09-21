import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { z } from "zod";

type Ctx = { params: { id: string } };

const tipoEnum = z
  .string()
  .trim()
  .transform((v) => v.toLowerCase())
  .refine((v) => v === "presencial" || v === "online", "tipo inválido")
  .transform((v) => (v === "online" ? "Online" : "Presencial"));

const updateSchema = z.object({
  nombre: z.string().trim().min(1).max(200).optional(),
  descripcion: z.string().trim().max(4000).nullable().optional(),
  fecha: z.string().min(1).optional(),
  lugar: z.string().trim().max(200).nullable().optional(),
  ciudad: z.string().trim().max(200).nullable().optional(),
  direccion: z.string().trim().max(300).nullable().optional(),
  tipo: tipoEnum.optional(), // <- restringido
  reglas: z.string().trim().min(1).max(10000).optional(),
  isPublished: z.boolean().optional(),
  isTicketed: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: Ctx) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const evento = await prisma.evento.findUnique({
    where: { id: params.id },
    select: {
      id: true, nombre: true, descripcion: true, fecha: true,
      lugar: true, ciudad: true, direccion: true,
      tipo: true, reglas: true, isPublished: true, isTicketed: true,
      createdAt: true, updatedAt: true,
    },
  });

  if (!evento) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ data: evento }, { status: 200 });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const data: any = {
    ...(d.nombre !== undefined ? { nombre: d.nombre } : {}),
    ...(d.descripcion !== undefined ? { descripcion: d.descripcion } : {}),
    ...(d.fecha !== undefined ? { fecha: new Date(d.fecha) } : {}),
    ...(d.lugar !== undefined ? { lugar: d.lugar } : {}),
    ...(d.ciudad !== undefined ? { ciudad: d.ciudad } : {}),
    ...(d.direccion !== undefined ? { direccion: d.direccion } : {}),
    ...(d.tipo !== undefined ? { tipo: d.tipo } : {}),
    ...(d.reglas !== undefined ? { reglas: d.reglas } : {}),
    ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
  };

  // Regla: si el tipo es Online => isTicketed = false
  if (d.tipo === "Online") {
    data.isTicketed = false;
  } else if (d.isTicketed !== undefined) {
    data.isTicketed = d.isTicketed;
  }

  const updated = await prisma.evento.update({
    where: { id: params.id },
    data,
    select: { id: true },
  });

  return NextResponse.json({ data: updated }, { status: 200 });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  await prisma.evento.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}