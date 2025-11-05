// En: app/api/eventos/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/");
  const id = segments[segments.length - 1];
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  // 1. Cambiamos 'select' por 'include' para traer las relaciones
  const evento = await prisma.evento.findFirst({
    where: { id, isPublished: true, isTicketed: true },
    include: {
      // Incluimos el 'tipo' de evento (EventType)
      tipo: {
        select: { name: true }
      },
      // Incluimos el 'venue' (lugar)
      venue: {
        include: {
          // Incluimos la 'address' (dirección)
          address: {
            include: {
              // Incluimos la 'comuna' (ciudad) y su 'region'
              comuna: {
                include: {
                  region: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!evento) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // 2. "Aplanamos" el objeto 'evento' para que la API
  // devuelva la estructura que el frontend probablemente espera.
  const flatEvento = {
    id: evento.id,
    nombre: evento.nombre,
    fecha: evento.fecha,
    descripcion: evento.descripcion,
    image: evento.image, // También incluí la imagen
    
    // Datos aplanados de las relaciones
    tipo: evento.tipo?.name || null,
    lugar: evento.venue?.name || null,
    ciudad: evento.venue?.address?.comuna?.name || null,
    region: evento.venue?.address?.comuna?.region?.name || null,
    // Combinamos 'street' y 'reference' para la dirección
    direccion: [evento.venue?.address?.street, evento.venue?.address?.reference]
      .filter(Boolean) // Filtra nulos o strings vacíos
      .join(', ') || null,
  };

  // 3. Devolvemos el objeto aplanado
  return NextResponse.json({ data: flatEvento }, { status: 200 });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;