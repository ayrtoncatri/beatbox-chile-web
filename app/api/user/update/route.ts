import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { nombres, apellidoPaterno, apellidoMaterno, region, comuna, edad, image } = await req.json();

  try {
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        region,
        comuna,
        edad: edad ? Number(edad) : null,
        image,
      },
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}