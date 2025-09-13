import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// youtu.be/XXXXX o youtube.com/watch?v=XXXXX
const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}(\S+)?$/i;

const DEFAULT_EVENT = {
  nombre: "Wildcard General",
  tipo: "Online",
  reglas: "Auto-generado para wildcards sin evento asignado",
};

export async function GET() {
  try {
    const wildcards = await prisma.wildcard.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        youtubeUrl: true,
        nombreArtistico: true, 
      },
    });
    return NextResponse.json({ ok: true, wildcards }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { youtubeUrl, userId, nombreArtistico } = await req.json();

  // Validaciones mínimas
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!youtubeUrl || !YT_REGEX.test(youtubeUrl)) {
    return NextResponse.json({ error: "URL de YouTube inválida" }, { status: 400 });
  }

  // (Opcional pero sano) verifica que el usuario exista
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Usuario inválido" }, { status: 401 });
  }

  // Usa/crea evento por defecto porque el schema exige eventoId
  let evento = await prisma.evento.findFirst({
    where: { nombre: DEFAULT_EVENT.nombre, tipo: DEFAULT_EVENT.tipo },
  });

  if (!evento) {
    evento = await prisma.evento.create({
      data: {
        nombre: DEFAULT_EVENT.nombre,
        tipo: DEFAULT_EVENT.tipo,
        reglas: DEFAULT_EVENT.reglas,
        fecha: new Date(),
      },
    });
  }

  const wildcard = await prisma.wildcard.create({
    data: { youtubeUrl, userId, eventoId: evento.id, nombreArtistico }, // 👈 agrega aquí
    select: { id: true, youtubeUrl: true, nombreArtistico: true, userId: true, eventoId: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, wildcard }, { status: 201 });
}
