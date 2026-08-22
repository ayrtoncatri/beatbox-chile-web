import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/privacy";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          nombres: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          birthDate: true,
          comunaId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      roles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
      wildcards: {
        select: {
          id: true,
          youtubeUrl: true,
          nombreArtistico: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      compras: {
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          updatedAt: true,
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              subtotal: true,
            },
          },
        },
      },
      sugerencias: {
        select: {
          id: true,
          asunto: true,
          mensaje: true,
          estado: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      mensajes: {
        select: {
          id: true,
          nombre: true,
          email: true,
          mensaje: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  // La exportacion se registra sin incluir el contenido exportado en el log.
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "PRIVACY_EXPORT",
        resourceType: "User",
        resourceId: user.id,
        outcome: "SUCCESS",
        metadata: { formatVersion: 1 },
        ...getRequestMetadata(req),
      },
    });
  } catch (error) {
    console.error("Privacy export audit log error:", error);
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    formatVersion: 1,
    data: user,
  };

  return NextResponse.json(payload, {
    headers: {
      "Content-Disposition": `attachment; filename=datos-personales-${user.id}.json`,
      "Cache-Control": "no-store",
    },
  });
}
