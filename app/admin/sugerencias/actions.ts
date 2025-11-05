"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureAdminPage } from "@/lib/permissions";
import { Prisma , SuggestionStatus } from "@prisma/client";

// Esquema para validar actualización de sugerencia
const SugerenciaUpdateSchema = z.object({
  id: z.string(),
  estado: z.nativeEnum(SuggestionStatus).optional(),
  notaPrivada: z.string().optional(),
});

//
// --- LA FUNCIÓN 'getSugerencias' SE HA ELIMINADO DE AQUÍ ---
// La lógica ahora vive en 'page.tsx' para evitar el caché,
// siguiendo el patrón de 'wildcards/page.tsx'.
//

/**
 * Obtiene una sugerencia por su ID
 */
export async function getSugerenciaById(id: string) {
  await ensureAdminPage();
  
  return prisma.sugerencia.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              nombres: true,
              apellidoPaterno: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Actualiza el estado y/o nota privada de una sugerencia
 */
export async function updateSugerencia(prevState: any, formData: FormData) {
  await ensureAdminPage();

  const validatedFields = SugerenciaUpdateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Error de validación.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...dataToUpdate } = validatedFields.data;

  try {
    await prisma.sugerencia.update({
      where: { id },
      data: {
        ...dataToUpdate,
      },
    });

    revalidatePath("/admin/sugerencias");
    return { success: true, message: "Sugerencia actualizada exitosamente." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error al actualizar la sugerencia." };
  }
}

/**
 * Elimina una sugerencia por su ID
 */
export async function deleteSugerencia(id: string) {
  await ensureAdminPage();

  try {
    await prisma.sugerencia.delete({
      where: { id },
    });
    revalidatePath("/admin/sugerencias");
    return { success: true, message: "Sugerencia eliminada correctamente." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error al eliminar la sugerencia." };
  }
}

/**
 * Exporta las sugerencias filtradas a un archivo CSV
 */
export async function exportSugerenciasToCSV(filters: {
  search?: string;
  userId?: string;
  estado?: string;
  from?: string;
  to?: string;
}) {
  await ensureAdminPage();
  
  const { search, userId, estado, from, to } = filters;
  
  const where: any = {};
  
  if (search) {
    where.OR = [
      { mensaje: { contains: search, mode: 'insensitive' } },
      { nombre: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { asunto: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { profile: { nombres: { contains: search, mode: 'insensitive' } } } },
      { user: { profile: { apellidoPaterno: { contains: search, mode: 'insensitive' } } } },
      { user: { profile: { apellidoMaterno: { contains: search, mode: 'insensitive' } } } },
    ];
  }
  
  if (userId && userId !== "") {
    where.userId = userId;
  }
  
  if (estado && estado !== "all" && estado !== "") { 
    if (Object.values(SuggestionStatus).includes(estado as SuggestionStatus)) {
      where.estado = estado as SuggestionStatus;
    }
  }
  
  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = new Date(from);
    }
    if (to) {
      where.createdAt.lte = new Date(to);
    }
  }
  
  const sugerencias = await prisma.sugerencia.findMany({
    where,
    include: {
      user: {
        select: {
          email: true,
          profile: {
            select: {
              nombres: true,
              apellidoPaterno: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const csvHeader = 'ID,Fecha,Usuario,Email,Estado,Mensaje,NotaPrivada\n';
  const csvRows = sugerencias.map(s => {
    const userName = s.user ? `${s.user.profile?.nombres || ''} ${s.user.profile?.apellidoPaterno || ''}`.trim() : s.nombre || '';
    const email = s.user ? s.user.email : s.email || '';
    const fecha = s.createdAt.toLocaleString();
    const mensaje = (s.mensaje || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const notaPrivada = (s.notaPrivada || '').replace(/"/g, '""').replace(/\n/g, ' ');
    
    return `"${s.id}","${fecha}","${userName}","${email}","${s.estado}","${mensaje}","${notaPrivada}"`;
  });
  
  return csvHeader + csvRows.join('\n');
}