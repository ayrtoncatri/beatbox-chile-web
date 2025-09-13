// app/api/sugerencias/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { mensaje, userId } = await req.json();

    if (!mensaje || typeof mensaje !== "string" || mensaje.trim().length < 5) {
      return NextResponse.json(
        { error: "El mensaje es demasiado corto." },
        { status: 400 }
      );
    }

    // Si llega userId, validamos que exista. (Si no, se guarda anónima)
    if (userId) {
      const exists = await prisma.user.findUnique({ where: { id: userId } });
      if (!exists) {
        return NextResponse.json({ error: "Usuario inválido." }, { status: 400 });
      }
    }

    const sugerencia = await prisma.sugerencia.create({
      data: {
        mensaje: mensaje.trim(),
        userId: userId ?? null,
      },
      select: { id: true, mensaje: true, userId: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, sugerencia }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// (opcional, útil para probar rápido en el navegador)
export async function GET() {
  const ultimas = await prisma.sugerencia.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, mensaje: true, createdAt: true, userId: true },
  });
  return NextResponse.json({ ok: true, sugerencias: ultimas });
}
