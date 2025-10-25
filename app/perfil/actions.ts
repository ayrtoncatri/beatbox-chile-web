"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const UpdatePerfilSchema = z.object({
  nombres: z.string().max(100).optional(),
  apellidoPaterno: z.string().max(100).optional(),
  apellidoMaterno: z.string().max(100).optional(),
  comunaId: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  birthDate: z.string().optional(),
  image: z.string().max(500).optional(),
});

export async function updatePerfil(prevState: any, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { ok: false, error: "No autorizado" };
    }

    const data = {
      nombres: formData.get("nombres")?.toString(),
      apellidoPaterno: formData.get("apellidoPaterno")?.toString(),
      apellidoMaterno: formData.get("apellidoMaterno")?.toString(),
      comunaId: formData.get("comunaId")?.toString(),
      birthDate: formData.get("birthDate")?.toString(),
      image: formData.get("image")?.toString(),
    };

    const parsed = UpdatePerfilSchema.parse(data);

    // Busca el usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) return { ok: false, error: "Usuario no encontrado" };

    // Actualiza UserProfile
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        nombres: parsed.nombres,
        apellidoPaterno: parsed.apellidoPaterno,
        apellidoMaterno: parsed.apellidoMaterno,
        birthDate: parsed.birthDate ? new Date(parsed.birthDate) : undefined,
        comunaId: parsed.comunaId,
      },
      create: {
        userId: user.id,
        nombres: parsed.nombres,
        apellidoPaterno: parsed.apellidoPaterno,
        apellidoMaterno: parsed.apellidoMaterno,
        birthDate: parsed.birthDate ? new Date(parsed.birthDate) : undefined,
        comunaId: parsed.comunaId,
      },
    });

    // Actualiza imagen si corresponde
    if (parsed.image) {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: parsed.image },
      });
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al actualizar perfil" };
  }
}