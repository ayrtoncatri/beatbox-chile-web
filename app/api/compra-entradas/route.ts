import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type TipoEntrada = "General" | "VIP";

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

    // Sesión de usuario
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Validar evento
    const evento = await prisma.evento.findFirst({
      where: { id: eventoId, isPublished: true, isTicketed: true, fecha: { gte: new Date() } },
      select: { id: true, nombre: true, fecha: true },
    });
    if (!evento) return NextResponse.json({ error: "Evento no disponible para compra" }, { status: 400 });

    // Buscar tipo de ticket
    const ticketType = await prisma.ticketType.findFirst({
      where: { eventId: evento.id, name: tipoEntrada, isActive: true },
      select: { id: true, price: true },
    });
    if (!ticketType) return NextResponse.json({ error: "Tipo de entrada no disponible" }, { status: 400 });

    // Crear compra y compraItem
    const compra = await prisma.compra.create({
      data: {
        userId,
        eventoId: evento.id,
        total: ticketType.price * cantidad,
        items: {
          create: [{
            ticketTypeId: ticketType.id,
            quantity: cantidad,
            unitPrice: ticketType.price,
            subtotal: ticketType.price * cantidad,
          }]
        }
      },
      select: {
        id: true,
        total: true,
        items: true,
        createdAt: true,
      }
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