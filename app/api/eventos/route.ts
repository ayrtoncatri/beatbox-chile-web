import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const eventos = await prisma.evento.findMany({
      where: {
        isPublished: true,
        isTicketed: true,
        fecha: { gte: new Date() },
      },
      select: {
        id: true,
        nombre: true,
        fecha: true,
        tipo: { select: { name: true } },
        venue: {
          select: {
            name: true,
            address: {
              select: {
                comuna: {
                  select: {
                    name: true,
                    region: { select: { name: true } }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { fecha: "asc" },
    });

    // Adaptar para frontend
    const data = eventos.map(ev => ({
      id: ev.id,
      nombre: ev.nombre,
      fecha: ev.fecha,
      tipo: ev.tipo?.name ?? null,
      lugar: ev.venue?.name ?? null,
      ciudad: ev.venue?.address?.comuna?.name ?? null,
      region: ev.venue?.address?.comuna?.region?.name ?? null,
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;