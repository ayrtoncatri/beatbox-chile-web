import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";

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
      user: { select: { id: true, nombres: true, email: true } },
    },
  });
  if (!sugerencia) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sugerencia);
}

export async function PATCH(req: NextRequest) {
  await ensureAdminApi();
  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { estado } = await req.json();
  const sugerencia = await prisma.sugerencia.update({
    where: { id },
    data: { estado },
    select: { id: true, estado: true },
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