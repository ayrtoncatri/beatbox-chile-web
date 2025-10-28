import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { nombres, apellidoPaterno, apellidoMaterno, comunaId, birthDate, image } = await req.json();

  try {
    // Busca el usuario y actualiza el perfil
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Actualiza UserProfile
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        comunaId: comunaId ? Number(comunaId) : undefined,
      },
      create: {
        userId: user.id,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        comunaId: comunaId ? Number(comunaId) : undefined,
      },
    });

    // Actualiza imagen si corresponde
    if (image !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: { image },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}