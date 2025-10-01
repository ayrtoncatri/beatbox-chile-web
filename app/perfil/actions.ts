"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const UpdatePerfilSchema = z.object({
  nombres: z.string().max(100).optional(),
  apellidoPaterno: z.string().max(100).optional(),
  apellidoMaterno: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  comuna: z.string().max(100).optional(),
  edad: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  image: z.string().max(500).optional(),
});

export async function updatePerfil(prevState: any, formData: FormData) {
  try {
    // Verificar que el usuario esté autenticado
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { ok: false, error: "No autorizado" };
    }

    const data = {
      nombres: formData.get("nombres")?.toString(),
      apellidoPaterno: formData.get("apellidoPaterno")?.toString(),
      apellidoMaterno: formData.get("apellidoMaterno")?.toString(),
      region: formData.get("region")?.toString(),
      comuna: formData.get("comuna")?.toString(),
      edad: formData.get("edad")?.toString(),
      image: formData.get("image")?.toString(),
    };

    const parsed = UpdatePerfilSchema.parse(data);

    // Actualizar el perfil del usuario
    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        nombres: parsed.nombres || undefined,
        apellidoPaterno: parsed.apellidoPaterno || undefined,
        apellidoMaterno: parsed.apellidoMaterno || undefined,
        region: parsed.region || undefined,
        comuna: parsed.comuna || undefined,
        edad: parsed.edad || undefined,
        image: parsed.image || undefined,
      },
    });

    return { ok: true, user: updated };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al actualizar perfil" };
  }
}