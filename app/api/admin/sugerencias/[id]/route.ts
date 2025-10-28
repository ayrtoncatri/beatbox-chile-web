import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { z } from "zod";
import { SuggestionStatus } from "@prisma/client";

function getIdFromRequest(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/");
  return segments[segments.length - 1];
}

export async function GET(req: NextRequest) {
  await ensureAdminApi();
  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sugerencia = await prisma.sugerencia.findUnique({
    where: { id },
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
              apellidoPaterno: true,
            }
          }
        } 
      },
    },
  });

  if (!sugerencia) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sugerencia);
}

const patchSchema = z.object({
  estado: z.nativeEnum(SuggestionStatus).optional(),
  notaPrivada: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  await ensureAdminApi();
  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const sugerencia = await prisma.sugerencia.update({
    where: { id },
    data: parsed.data, 
    select: { id: true, estado: true, notaPrivada: true },
  });
  return NextResponse.json(sugerencia);
}

export async function DELETE(req: NextRequest) {
  await ensureAdminApi();
  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.sugerencia.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}