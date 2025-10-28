import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// youtu.be/XXXXX o youtube.com/watch?v=XXXXX
const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}(\S+)?$/i;

// --- GET (Sin cambios) ---
export async function GET() {
  try {
    const wildcards = await prisma.wildcard.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        youtubeUrl: true,
        nombreArtistico: true,
        categoria: true,
      },
    });
    return NextResponse.json({ ok: true, wildcards }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'Error interno' },
      { status: 500 },
    );
  }
}

// --- POST (Actualizado con validación de deadline) ---
export async function POST(req: Request) {
  // 1. Obtener la sesión de forma segura en el servidor
  const session = await getServerSession(authOptions);

  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // 2. Obtener los datos del body
  const { youtubeUrl, nombreArtistico, categoria, eventoId } =
    await req.json();

  // 3. Validaciones de los datos recibidos
  if (!youtubeUrl || !YT_REGEX.test(youtubeUrl)) {
    return NextResponse.json(
      { error: 'URL de YouTube inválida' },
      { status: 400 },
    );
  }
  if (!eventoId) {
    return NextResponse.json(
      { error: 'ID de evento faltante' },
      { status: 400 },
    );
  }

  try {
    // 4. Verificar que el evento exista
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      // Traemos solo el campo que necesitamos
      select: { wildcardDeadline: true },
    });
    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 },
      );
    }

    // 5. --- 🔽 ¡NUEVA VALIDACIÓN DE DEADLINE! 🔽 ---
    if (!evento.wildcardDeadline) {
      return NextResponse.json(
        { error: 'Este evento no acepta wildcards.' },
        { status: 403 }, // 403 Forbidden
      );
    }
    if (new Date(evento.wildcardDeadline) < new Date()) {
      return NextResponse.json(
        { error: 'El plazo para enviar wildcards ha cerrado.' },
        { status: 403 }, // 403 Forbidden
      );
    }
    // --- 🔼 FIN DE LA VALIDACIÓN 🔼 ---

    // 6. (Clave) Verificar que el usuario no haya enviado antes
    const existingWildcard = await prisma.wildcard.findUnique({
      where: {
        userId_eventoId: {
          userId: userId,
          eventoId: eventoId,
        },
      },
    });

    if (existingWildcard) {
      return NextResponse.json(
        { error: 'Ya enviaste una wildcard para este evento' },
        { status: 409 }, // 409 Conflict
      );
    }

    // 7. Crear la Wildcard
    const wildcard = await prisma.wildcard.create({
      data: {
        youtubeUrl,
        nombreArtistico,
        categoria,
        userId: userId,
        eventoId: eventoId,
      },
      select: {
        id: true,
        youtubeUrl: true,
        nombreArtistico: true,
        categoria: true,
        userId: true,
        eventoId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, wildcard }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Error al crear la wildcard' },
      { status: 500 },
    );
  }
}

// --- PUT (Actualizado con validación de deadline) ---
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  // 1. Validar por ID de sesión
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id, nombreArtistico, youtubeUrl } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: 'ID de wildcard requerido' },
      { status: 400 },
    );
  }
  if (!youtubeUrl || !YT_REGEX.test(youtubeUrl)) {
    return NextResponse.json(
      { error: 'URL de YouTube inválida' },
      { status: 400 },
    );
  }

  // 2. Busca la wildcard Y el deadline de su evento
  const wildcard = await prisma.wildcard.findFirst({
    where: { id, userId: userId },
    // --- 🔽 CAMBIO AQUÍ 🔽 ---
    include: {
      evento: {
        select: { wildcardDeadline: true },
      },
    },
    // --- 🔼 FIN DEL CAMBIO 🔼 ---
  });

  if (!wildcard) {
    return NextResponse.json(
      { error: 'Wildcard no encontrada o no te pertenece' },
      { status: 404 },
    );
  }

  // 3. (Opcional) Verificar si la wildcard está PENDING
  if (wildcard.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'No puedes modificar una wildcard que ya ha sido revisada' },
      { status: 403 },
    );
  }

  // 4. --- 🔽 ¡NUEVA VALIDACIÓN DE DEADLINE! 🔽 ---
  const deadline = wildcard.evento.wildcardDeadline;
  if (!deadline || new Date(deadline) < new Date()) {
    return NextResponse.json(
      { error: 'El plazo para modificar wildcards ha cerrado.' },
      { status: 403 },
    );
  }
  // --- 🔼 FIN DE LA VALIDACIÓN 🔼 ---

  // 5. Actualizar
  const updated = await prisma.wildcard.update({
    where: { id: wildcard.id },
    data: { nombreArtistico, youtubeUrl },
  });

  return NextResponse.json({ ok: true, wildcard: updated });
}