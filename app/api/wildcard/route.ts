import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

const DEFAULT_EVENT_TYPE = "Online";

export async function GET() {
  try {
    const wildcards = await prisma.wildcard.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        youtubeUrl: true,
        nombreArtistico: true,
        categoria: true, // 👈 nuevo campo
      },
    });
    return NextResponse.json({ ok: true, wildcards }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { youtubeUrl, userId, nombreArtistico, categoria } = await req.json(); // 👈 nuevo campo

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

  // Busca el EventType "Online"
  let eventType = await prisma.eventType.findUnique({
    where: { name: DEFAULT_EVENT_TYPE },
  });

  if (!eventType) {
    eventType = await prisma.eventType.create({
      data: { name: DEFAULT_EVENT_TYPE },
    });
  }

  // Usa/crea evento por defecto porque el schema exige eventoId
  let evento = await prisma.evento.findFirst({
    where: { nombre: DEFAULT_EVENT.nombre, tipoId: eventType.id },
  });

  if (!evento) {
    evento = await prisma.evento.create({
      data: {
        nombre: DEFAULT_EVENT.nombre,
        tipoId: eventType.id, // 👈 conecta el tipo por id
        reglas: DEFAULT_EVENT.reglas,
        fecha: new Date(),
      },
    });
  }

  const wildcard = await prisma.wildcard.create({
    data: { youtubeUrl, userId, eventoId: evento.id, nombreArtistico, categoria }, // 👈 nuevo campo
    select: { id: true, youtubeUrl: true, nombreArtistico: true, categoria: true, userId: true, eventoId: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, wildcard }, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id, nombreArtistico, youtubeUrl } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID de wildcard requerido" }, { status: 400 });
  }
  if (!youtubeUrl || !YT_REGEX.test(youtubeUrl)) {
    return NextResponse.json({ error: "URL de YouTube inválida" }, { status: 400 });
  }

  // Busca el usuario y la wildcard
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const wildcard = await prisma.wildcard.findFirst({
    where: { id, userId: user.id },
  });
  if (!wildcard) {
    return NextResponse.json({ error: "Wildcard no encontrada" }, { status: 404 });
  }

  const updated = await prisma.wildcard.update({
    where: { id },
    data: { nombreArtistico, youtubeUrl },
  });

  return NextResponse.json({ ok: true, wildcard: updated });
}
