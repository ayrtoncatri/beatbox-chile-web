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

  // Validar edad
  if (edad !== undefined && edad !== null && edad !== "") {
    const edadNum = Number(edad);
    if (isNaN(edadNum)) {
      return NextResponse.json({ error: "La edad debe ser un número válido" }, { status: 400 });
    }
    if (edadNum < 10) {
      return NextResponse.json({ error: "La edad mínima es 10 años" }, { status: 400 });
    }
    if (edadNum > 80) {
      return NextResponse.json({ error: "La edad máxima es 80 años" }, { status: 400 });
    }
  }

  try {
    const updateData: any = {};
    
    if (nombres !== undefined) updateData.nombres = nombres;
    if (apellidoPaterno !== undefined) updateData.apellidoPaterno = apellidoPaterno;
    if (apellidoMaterno !== undefined) updateData.apellidoMaterno = apellidoMaterno;
    if (region !== undefined) updateData.region = region;
    if (comuna !== undefined) updateData.comuna = comuna;
    if (edad !== undefined) updateData.edad = edad ? Number(edad) : null;
    if (image !== undefined) updateData.image = image;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}