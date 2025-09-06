import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TipoEntrada = "General" | "VIP";
const PRECIOS: Record<TipoEntrada, number> = {
  General: 8000,
  VIP: 15000,
};

export async function POST(req: Request) {
  try {
    const { userId, eventoId, tipoEntrada, cantidad } = await req.json();

    if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    if (!eventoId) return NextResponse.json({ error: "eventoId requerido" }, { status: 400 });
    if (!tipoEntrada || !["General", "VIP"].includes(tipoEntrada))
      return NextResponse.json({ error: "tipoEntrada inválido" }, { status: 400 });
    const qty = Number(cantidad);
    if (!qty || qty < 1) return NextResponse.json({ error: "cantidad inválida" }, { status: 400 });

    const [user, evento] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.evento.findUnique({ where: { id: eventoId } }),
    ]);

    if (!user) return NextResponse.json({ error: "Usuario inválido" }, { status: 401 });
    if (!evento) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

    const precioUnitario = PRECIOS[tipoEntrada as TipoEntrada] ?? 0;
    const total = precioUnitario * qty;

    const compra = await prisma.compraEntrada.create({
      data: {
        userId,
        userNombre: user.name ?? "",
        userEmail: user.email,
        eventoId,
        eventoNombre: evento.nombre,
        eventoFecha: evento.fecha,
        tipoEntrada,
        cantidad: qty,
        precioUnitario,
        total,
      },
      select: {
        id: true,
        total: true,
        tipoEntrada: true,
        cantidad: true,
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
