import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const eventos = await prisma.evento.findMany({
      where: {
        NOT: { tipo: "Online" },
        // para mostrar eventos futuros fecha: { gte: new Date() },
      },
      select: { id: true, nombre: true, fecha: true, tipo: true },
      orderBy: { fecha: "asc" },
    });

    return NextResponse.json({ ok: true, eventos }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

