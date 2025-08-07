import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// (Valida el POST y guarda el link en la BD)
export async function POST(request: NextRequest) {
  const { youtubeUrl, userId, eventoId } = await request.json();

  // (Opcional: Valida que sea un enlace de YouTube real)
  if (!youtubeUrl || !/^https:\/\/(www\.)?youtube\.com|youtu\.be/.test(youtubeUrl)) {
    return NextResponse.json({ error: "Enlace no válido" }, { status: 400 });
  }

  // TODO: userId y eventoId deberían recibirse según sesión/contexto real
  // Aquí está hardcodeado solo de ejemplo:
  const wildcard = await prisma.wildcard.create({
    data: {
      youtubeUrl,
      userId: userId ?? "test-user-id",
      eventoId: eventoId ?? "test-evento-id"
    }
  });

  return NextResponse.json(wildcard, { status: 201 });
}
