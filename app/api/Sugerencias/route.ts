import { NextResponse , NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await req.json();
  const { asunto, mensaje }: { asunto?: string; mensaje: string } = body;

  if (!mensaje || mensaje.trim() === '') {
    return NextResponse.json(
      { error: 'El campo mensaje es requerido' },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 },
      );
    }

    const sugerencia = await prisma.sugerencia.create({
      data: {
        mensaje: mensaje,
        asunto: asunto,
        userId: user.id,
      },
      select: {
        id: true,
        asunto: true,
        mensaje: true,
        estado: true,
        createdAt: true,
        userId: true,
      },
    });

    return NextResponse.json({ ok: true, sugerencia }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Error al crear la sugerencia' },
      { status: 500 },
    );
  }
}

export async function GET() {
  const ultimas = await prisma.sugerencia.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, mensaje: true, createdAt: true, userId: true },
  });
  return NextResponse.json({ ok: true, sugerencias: ultimas });
}
