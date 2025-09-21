import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const eventos = await prisma.evento.findMany({
      where: {
        isPublished: true,
        isTicketed: true,
        fecha: { gte: new Date() },
      },
      select: { id: true, nombre: true, fecha: true, lugar: true, ciudad: true },
      orderBy: { fecha: "asc" },
    });
    return NextResponse.json({ data: eventos }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;