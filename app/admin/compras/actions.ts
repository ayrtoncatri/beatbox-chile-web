"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureAdminPage } from "@/lib/permissions";

/**
 * Obtiene todas las compras con filtros opcionales (modelo normalizado)
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
  await ensureAdminPage();

  const {
    search,
    eventId,
    tipo,
    from,
    to,
    page = 1,
    pageSize = 20,
    sort = "fecha_desc",
  } = filters;

  let orderBy: any = {};
  switch (sort) {
    case "fecha_asc":
      orderBy = { createdAt: "asc" };
      break;
    case "total_desc":
      orderBy = { total: "desc" };
      break;
    case "total_asc":
      orderBy = { total: "asc" };
      break;
    case "fecha_desc":
    default:
      orderBy = { createdAt: "desc" };
  }

  // Filtros normalizados
  const where: any = {};
  if (search) {
    where.OR = [
      { user: { profile: { nombres: { contains: search, mode: "insensitive" } } } },
      { user: { profile: { apellidoPaterno: { contains: search, mode: "insensitive" } } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { evento: { nombre: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (eventId) where.eventoId = eventId;
  if (from) where.createdAt = { ...where.createdAt, gte: new Date(from) };
  if (to) where.createdAt = { ...where.createdAt, lte: new Date(to) };

  // Filtro por tipo de ticket (en items)
  if (tipo) {
    where.items = {
      some: {
        ticketType: { name: tipo }
      }
    };
  }

  // Consulta principal
  const [total, compras] = await Promise.all([
    prisma.compra.count({ where }),
    prisma.compra.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                nombres: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                comuna: { select: { name: true, region: { select: { name: true } } } },
              },
            },
          },
        },
        evento: {
          select: {
            id: true,
            nombre: true,
            fecha: true,
            tipo: { select: { name: true } },
            venue: { select: { name: true } },
          },
        },
        items: {
          include: {
            ticketType: { select: { name: true, price: true } },
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
  ]);

  // Estadísticas
  const ingresosBrutos = compras.reduce((acc, c) => acc + c.total, 0);
  const entradasVendidas = compras.reduce(
    (acc, c) => acc + c.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );
  const porTipo: Record<string, { cantidad: number; total: number }> = {};
  compras.forEach((c) =>
    c.items.forEach((i) => {
      const tipo = i.ticketType.name;
      if (!porTipo[tipo]) porTipo[tipo] = { cantidad: 0, total: 0 };
      porTipo[tipo].cantidad += i.quantity;
      porTipo[tipo].total += i.subtotal;
    })
  );

  return {
    compras,
    total,
    stats: {
      ingresosBrutos,
      entradasVendidas,
      porTipo,
    },
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Obtiene una compra por su ID (modelo normalizado)
 */
export async function getCompraById(id: string) {
  await ensureAdminPage();
  return prisma.compra.findUnique({
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
              apellidoMaterno: true,
              comuna: { select: { name: true, region: { select: { name: true } } } },
            },
          },
        },
      },
      evento: {
        select: {
          id: true,
          nombre: true,
          fecha: true,
          tipo: { select: { name: true } },
          venue: { select: { name: true } },
        },
      },
      items: {
        include: {
          ticketType: { select: { name: true, price: true } },
        },
      },
    },
  });
}

/**
 * Elimina una compra por su ID
 */
export async function deleteCompra(id: string) {
  await ensureAdminPage();

  try {
    await prisma.compra.delete({
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

  // Filtros normalizados
  const where: any = {};
  if (search) {
    where.OR = [
      { user: { profile: { nombres: { contains: search, mode: "insensitive" } } } },
      { user: { profile: { apellidoPaterno: { contains: search, mode: "insensitive" } } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { evento: { nombre: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (eventId) where.eventoId = eventId;
  if (from) where.createdAt = { ...where.createdAt, gte: new Date(from) };
  if (to) where.createdAt = { ...where.createdAt, lte: new Date(to) };
  if (tipo) {
    where.items = {
      some: {
        ticketType: { name: tipo }
      }
    };
  }

  const compras = await prisma.compra.findMany({
    where,
    include: {
      user: {
        select: {
          email: true,
          profile: {
            select: {
              nombres: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              comuna: { select: { name: true, region: { select: { name: true } } } },
            },
          },
        },
      },
      evento: {
        select: {
          nombre: true,
          fecha: true,
        },
      },
      items: {
        include: {
          ticketType: { select: { name: true, price: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Formatear datos para CSV
  const csvHeader = 'ID,FechaCompra,Usuario,Email,Comuna,Region,Evento,FechaEvento,TipoEntrada,Cantidad,PrecioUnitario,Total\n';
  const csvRows = compras.flatMap(c => {
    const fechaCompra = c.createdAt.toLocaleString();
    const fechaEvento = c.evento?.fecha ? new Date(c.evento.fecha).toLocaleDateString() : "";
    const nombreCompleto = c.user?.profile
      ? [c.user.profile.nombres, c.user.profile.apellidoPaterno, c.user.profile.apellidoMaterno].filter(Boolean).join(" ")
      : "";
    return c.items.map(item => (
      `"${c.id}","${fechaCompra}","${nombreCompleto}","${c.user?.email}","${c.user?.profile?.comuna?.name ?? ""}","${c.user?.profile?.comuna?.region?.name ?? ""}","${c.evento?.nombre ?? ""}","${fechaEvento}","${item.ticketType.name}",${item.quantity},${item.unitPrice},${item.subtotal}`
    ));
  });

  return csvHeader + csvRows.join('\n');
}