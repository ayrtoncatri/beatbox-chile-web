import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const evento = await prisma.evento.findFirst({
    where: { id, isPublished: true, isTicketed: true },
    select: {
      id: true,
      nombre: true,
      fecha: true,
      lugar: true,
      ciudad: true,
      direccion: true,
      descripcion: true,
    },
  });

  if (!evento) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ data: evento }, { status: 200 });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;