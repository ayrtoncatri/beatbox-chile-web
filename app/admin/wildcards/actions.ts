"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { InscripcionSource, WildcardStatus } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface ActionState {
  error?: string;
  success?: string;
}

const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}(\S+)?$/i;

const EditWildcardSchema = z.object({
  id: z.string().min(1),
  nombreArtistico: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  youtubeUrl: z.string().optional().refine(
    (val) => !val || YT_REGEX.test(val),
    { message: "URL de YouTube inválida" }
  ),
});

export async function editWildcard(prevState: any, formData: FormData) {
  try {
    const data = {
      id: formData.get("id") as string,
      nombreArtistico: formData.get("nombreArtistico")?.toString(),
      notes: formData.get("notes")?.toString(),
      youtubeUrl: formData.get("youtubeUrl")?.toString(),
    };
    const parsed = EditWildcardSchema.parse(data);

    const updated = await prisma.wildcard.update({
      where: { id: parsed.id },
      data: {
        nombreArtistico: parsed.nombreArtistico || undefined,
        notes: parsed.notes || undefined,
        youtubeUrl: parsed.youtubeUrl || undefined,
      },
    });

    revalidatePath(`/admin/wildcards`);
    revalidatePath(`/admin/wildcards/${parsed.id}`);

    return { ok: true, wildcard: updated };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al actualizar" };
  }
}

export async function approveWildcard(
  wildcardId: string
): Promise<ActionState> {
  
  const session = await getServerSession(authOptions);

  const userRoles = (session?.user as any)?.roles || [];
  if (!session?.user?.id || !userRoles.includes('admin')) {
    return { error: 'No autorizado. Se requiere ser administrador.' };
  }
  const adminUserId = session.user.id;
  // 1. Obtener el wildcard para asegurar que existe y está PENDIENTE
  const wildcard = await prisma.wildcard.findUnique({
    where: { id: wildcardId },
  });

  if (!wildcard) {
    return { error: 'Wildcard no encontrado.' };
  }
  if (wildcard.status !== WildcardStatus.PENDING) {
    return { error: 'Este wildcard ya ha sido revisado.' };
  }

  try {
    // 2. Iniciar la transacción de Prisma (CRUCIAL)
    await prisma.$transaction(async (tx) => {
      
      // 3a. Actualizar el Wildcard a APROBADO
      await tx.wildcard.update({
        where: { id: wildcardId },
        data: {
          status: WildcardStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedById: adminUserId,
        },
      });

      // 3b. (Robustez) Verificar si ya existe una inscripción (ej. admin la creó manualmente)
      const existingInscripcion = await tx.inscripcion.findUnique({
        where: {
          userId_eventoId_categoriaId: {
            userId: wildcard.userId,
            eventoId: wildcard.eventoId,
            categoriaId: wildcard.categoriaId,
          },
        },
      });

      if (existingInscripcion) {
        // Si ya existe, solo la vinculamos a este wildcard
        await tx.inscripcion.update({
          where: { id: existingInscripcion.id },
          data: { 
            wildcardId: wildcardId,
            source: InscripcionSource.WILDCARD // Actualizamos la fuente
          },
        });
      } else {
        // 3c. (Caso normal) Crear la nueva Inscripción
        await tx.inscripcion.create({
          data: {
            userId: wildcard.userId,
            eventoId: wildcard.eventoId,
            categoriaId: wildcard.categoriaId,
            nombreArtistico: wildcard.nombreArtistico, // Tomamos el nombre del wildcard
            source: InscripcionSource.WILDCARD, // Marcamos que vino de un wildcard
            wildcardId: wildcardId, // Vinculamos los dos registros
          },
        });
      }
    }); // Fin de la transacción

    // 4. Revalidar cachés y devolver éxito
    revalidatePath('/admin/wildcards');
    revalidatePath(`/admin/wildcards/${wildcardId}`);
    revalidatePath(`/historial-competitivo/eventos/${wildcard.eventoId}`);
    
    return { success: 'Wildcard aprobado. El participante ha sido inscrito.' };

  } catch (error) {
    console.error('Error al aprobar wildcard:', error);
    if ((error as any).code === 'P2002') { // Error de constraint (ej. wildcardId ya está en una inscripción)
      return { error: 'Error de consistencia: La inscripción para este wildcard ya existe.' };
    }
    return { error: 'Error del servidor al procesar la aprobación.' };
  }
}

/**
 * RECHAZA un Wildcard.
 */
export async function rejectWildcard(
  wildcardId: string
): Promise<ActionState> {

  const session = await getServerSession(authOptions);
  const userRoles = (session?.user as any)?.roles || [];
  if (!session?.user?.id || !userRoles.includes('admin')) {
    return { error: 'No autorizado.' };
  }
  const adminUserId = session.user.id;

  const wildcard = await prisma.wildcard.findUnique({
    where: { id: wildcardId, status: WildcardStatus.PENDING },
  });

  if (!wildcard) {
    return { error: 'Wildcard no encontrado o ya revisado.' };
  }

  try {
    await prisma.wildcard.update({
      where: { id: wildcardId },
      data: {
        status: WildcardStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedById: adminUserId,
      },
    });

    revalidatePath('/admin/wildcards');
    revalidatePath(`/admin/wildcards/${wildcardId}`);
    return { success: 'Wildcard rechazado correctamente.' };

  } catch (error) {
    console.error('Error al rechazar wildcard:', error);
    return { error: 'Error del servidor.' };
  }
}