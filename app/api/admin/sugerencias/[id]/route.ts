import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await ensureAdminApi();
  const sugerencia = await prisma.sugerencia.findUnique({
    where: { id: params.id },
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await ensureAdminApi();
  const { estado } = await req.json();
  const sugerencia = await prisma.sugerencia.update({
    where: { id: params.id },
    data: { estado },
    select: { id: true, estado: true },
  });
  return NextResponse.json(sugerencia);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await ensureAdminApi();
  await prisma.sugerencia.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}