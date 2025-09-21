import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type TipoEntrada = "General" | "VIP";
const PRECIOS: Record<TipoEntrada, number> = { General: 8000, VIP: 15000 };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 });

    const eventoId = String(body.eventoId || "");
    const tipoEntrada = String(body.tipoEntrada || "") as TipoEntrada;
    const cantidad = Number(body.cantidad);

    if (!eventoId) return NextResponse.json({ error: "eventoId requerido" }, { status: 400 });
    if (!["General", "VIP"].includes(tipoEntrada)) {
      return NextResponse.json({ error: "tipoEntrada inválido" }, { status: 400 });
    }
    if (!Number.isFinite(cantidad) || cantidad < 1) {
      return NextResponse.json({ error: "cantidad inválida" }, { status: 400 });
    }

    // 1) Sesión de usuario (NextAuth)
    const session = await getServerSession(authOptions);
    const userIdFromSession = (session?.user as any)?.id as string | undefined;
    const emailFromSession = session?.user?.email as string | undefined;
    if (!userIdFromSession && !emailFromSession) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 2) Cargar usuario desde DB (por id si existe, si no por email)
    const user =
      (userIdFromSession
        ? await prisma.user.findUnique({ where: { id: userIdFromSession } })
        : emailFromSession
        ? await prisma.user.findUnique({ where: { email: emailFromSession } })
        : null);

    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    if (user.isActive === false) {
      return NextResponse.json({ error: "Cuenta desactivada" }, { status: 403 });
    }

    // 3) Validar evento público, presencial y futuro
    const evento = await prisma.evento.findFirst({
      where: { id: eventoId, isPublished: true, isTicketed: true, fecha: { gte: new Date() } },
      select: { id: true, nombre: true, fecha: true },
    });
    if (!evento) return NextResponse.json({ error: "Evento no disponible para compra" }, { status: 400 });

    // 4) Calcular totales e insertar compra
    const precioUnitario = PRECIOS[tipoEntrada];
    const total = precioUnitario * cantidad;

    const compra = await prisma.compraEntrada.create({
      data: {
        userId: user.id,
        userNombre: user.nombres ?? "",
        userEmail: user.email,
        eventoId: evento.id,
        eventoNombre: evento.nombre,
        eventoFecha: evento.fecha,
        tipoEntrada,
        cantidad,
        precioUnitario,
        total,
      },
      select: {
        id: true,
        tipoEntrada: true,
        cantidad: true,
        precioUnitario: true,
        total: true,
        eventoNombre: true,
        eventoFecha: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, compra }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;