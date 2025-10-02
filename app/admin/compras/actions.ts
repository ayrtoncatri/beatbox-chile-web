"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureAdminPage } from "@/lib/permissions";

/**
 * Obtiene todas las compras con filtros opcionales
 */
export async function getCompras(filters: {
  search?: string;
  eventId?: string;
  tipo?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}) {
  const session = await ensureAdminPage();
  
  const { 
    search, 
    eventId, 
    tipo, 
    from, 
    to, 
    page = 1, 
    pageSize = 20,
    sort = "fecha_desc"
  } = filters;
  
  // Configurar ordenamiento
  let orderBy: any = {};
  
  switch(sort) {
    case "fecha_asc":
      orderBy = { createdAt: 'asc' };
      break;
    case "total_desc":
      orderBy = { total: 'desc' };
      break;
    case "total_asc":
      orderBy = { total: 'asc' };
      break;
    case "fecha_desc":
    default:
      orderBy = { createdAt: 'desc' };
  }
  
  // Construir filtros de búsqueda
  const where: any = {};
  
  if (search) {
    where.OR = [
      { userNombre: { contains: search, mode: 'insensitive' } },
      { userEmail: { contains: search, mode: 'insensitive' } },
      { eventoNombre: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (eventId && eventId !== "") {
    where.eventoId = eventId;
  }
  
  if (tipo && tipo !== "") {
    where.tipoEntrada = tipo;
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
  
  // Obtener total de compras para paginación
  const total = await prisma.compraEntrada.count({ where });
  
  // Obtener compras paginadas
  const compras = await prisma.compraEntrada.findMany({
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
      evento: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy,
  });

  // Calcular estadísticas
  // Total de ingresos
  const ingresosBrutos = await prisma.compraEntrada.aggregate({
    where,
    _sum: {
      total: true,
    },
  });
  
  // Número de entradas vendidas
  const entradasVendidas = await prisma.compraEntrada.aggregate({
    where,
    _sum: {
      cantidad: true,
    },
  });
  
  // Conteo por tipo
  const comprasPorTipo = await prisma.compraEntrada.groupBy({
    by: ['tipoEntrada'],
    where,
    _sum: {
      cantidad: true,
      total: true,
    },
  });
  
  // Formatear estadísticas por tipo
  const porTipo = comprasPorTipo.reduce((acc, item) => {
    acc[item.tipoEntrada] = {
      cantidad: item._sum.cantidad || 0,
      total: item._sum.total || 0
    };
    return acc;
  }, {} as Record<string, { cantidad: number, total: number }>);
  
  return {
    compras,
    total,
    stats: {
      ingresosBrutos: ingresosBrutos._sum.total || 0,
      entradasVendidas: entradasVendidas._sum.cantidad || 0,
      porTipo,
    },
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Obtiene una compra por su ID
 */
export async function getCompraById(id: string) {
  await ensureAdminPage();
  
  return prisma.compraEntrada.findUnique({
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
      evento: true,
    },
  });
}

/**
 * Elimina una compra por su ID
 */
export async function deleteCompra(id: string) {
  await ensureAdminPage();

  try {
    await prisma.compraEntrada.delete({
      where: { id },
    });
    revalidatePath("/admin/compras");
    return { success: true, message: "Compra eliminada correctamente." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error al eliminar la compra." };
  }
}

/**
 * Exporta las compras filtradas a un archivo CSV
 */
export async function exportComprasToCSV(filters: {
  search?: string;
  eventId?: string;
  tipo?: string;
  from?: string;
  to?: string;
}) {
  await ensureAdminPage();
  
  const { search, eventId, tipo, from, to } = filters;
  
  // Construir filtros de búsqueda (igual que en getCompras)
  const where: any = {};
  
  if (search) {
    where.OR = [
      { userNombre: { contains: search, mode: 'insensitive' } },
      { userEmail: { contains: search, mode: 'insensitive' } },
      { eventoNombre: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (eventId && eventId !== "") {
    where.eventoId = eventId;
  }
  
  if (tipo && tipo !== "") {
    where.tipoEntrada = tipo;
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
  
  // Obtener todas las compras que coincidan con los filtros
  const compras = await prisma.compraEntrada.findMany({
    where,
    include: {
      user: {
        select: {
          email: true,
          nombres: true,
          apellidoPaterno: true,
        },
      },
      evento: {
        select: {
          nombre: true,
          fecha: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Formatear datos para CSV
  const csvHeader = 'ID,FechaCompra,Usuario,Email,Evento,FechaEvento,TipoEntrada,Cantidad,PrecioUnitario,Total\n';
  const csvRows = compras.map(c => {
    const fechaCompra = c.createdAt.toLocaleString();
    const fechaEvento = c.eventoFecha.toLocaleDateString();
    
    return `"${c.id}","${fechaCompra}","${c.userNombre}","${c.userEmail}","${c.eventoNombre}","${fechaEvento}","${c.tipoEntrada}",${c.cantidad},${c.precioUnitario},${c.total}`;
  });
  
  return csvHeader + csvRows.join('\n');
}