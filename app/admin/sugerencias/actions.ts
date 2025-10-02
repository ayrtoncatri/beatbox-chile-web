"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureAdminPage } from "@/lib/permissions";

// Esquema para validar actualización de sugerencia
const SugerenciaUpdateSchema = z.object({
  id: z.string(),
  estado: z.string().optional(),
  notaPrivada: z.string().optional(),
});

/**
 * Obtiene todas las sugerencias con filtros opcionales
 */
export async function getSugerencias(filters: {
  search?: string;
  userId?: string;
  estado?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await ensureAdminPage();
  
  const { search, userId, estado, from, to, page = 1, pageSize = 20 } = filters;
  
  // Construir filtros de búsqueda
  const where: any = {};
  
  if (search) {
    where.OR = [
      { mensaje: { contains: search, mode: 'insensitive' } },
      { nombre: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { asunto: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { nombres: { contains: search, mode: 'insensitive' } } },
    ];
  }
  
  if (userId && userId !== "") {
    where.userId = userId;
  }
  
  if (estado && estado !== "") {
    where.estado = estado;
  }
  
  if (from) {
    where.createdAt = {
      ...where.createdAt,
      gte: new Date(from),
    };
  }
  
  if (to) {
    where.createdAt = {
      ...where.createdAt,
      lte: new Date(to),
    };
  }
  
  // Obtener total de sugerencias para paginación
  const total = await prisma.sugerencia.count({ where });
  
  // Obtener sugerencias paginadas
  const sugerencias = await prisma.sugerencia.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          nombres: true,
          apellidoPaterno: true,
        },
      },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Contar por estado
  const countByEstado = await prisma.sugerencia.groupBy({
    by: ['estado'],
    _count: true,
    where,
  });

  // Formatear conteo por estado
  const countByEstadoObj = countByEstado.reduce((acc, item) => {
    acc[item.estado] = item._count;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    sugerencias,
    total,
    countByEstado: countByEstadoObj,
    totalPages: Math.ceil(total / pageSize),
  };
}

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
          nombres: true,
          apellidoPaterno: true,
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
        updatedAt: new Date(),
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
  
  // Construir filtros de búsqueda (igual que en getSugerencias)
  const where: any = {};
  
  if (search) {
    where.OR = [
      { mensaje: { contains: search, mode: 'insensitive' } },
      { nombre: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { asunto: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { nombres: { contains: search, mode: 'insensitive' } } },
    ];
  }
  
  if (userId && userId !== "") {
    where.userId = userId;
  }
  
  if (estado && estado !== "") {
    where.estado = estado;
  }
  
  if (from) {
    where.createdAt = {
      ...where.createdAt,
      gte: new Date(from),
    };
  }
  
  if (to) {
    where.createdAt = {
      ...where.createdAt,
      lte: new Date(to),
    };
  }
  
  // Obtener todas las sugerencias que coincidan con los filtros
  const sugerencias = await prisma.sugerencia.findMany({
    where,
    include: {
      user: {
        select: {
          email: true,
          nombres: true,
          apellidoPaterno: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Formatear datos para CSV
  const csvHeader = 'ID,Fecha,Usuario,Email,Estado,Mensaje,NotaPrivada\n';
  const csvRows = sugerencias.map(s => {
    const userName = s.user ? `${s.user.nombres || ''} ${s.user.apellidoPaterno || ''}`.trim() : s.nombre || '';
    const email = s.user ? s.user.email : s.email || '';
    const fecha = s.createdAt.toLocaleString();
    const mensaje = (s.mensaje || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const notaPrivada = (s.notaPrivada || '').replace(/"/g, '""').replace(/\n/g, ' ');
    
    return `"${s.id}","${fecha}","${userName}","${email}","${s.estado}","${mensaje}","${notaPrivada}"`;
  });
  
  return csvHeader + csvRows.join('\n');
}