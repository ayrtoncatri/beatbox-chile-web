import SugerenciasPageWrapper from "@/components/admin/sugerencias/SugerenciasPageWrapper";
import { prisma } from "@/lib/prisma"; 
import { Sugerencia, User, Prisma, SuggestionStatus } from "@prisma/client";

// Forzamos a que la página sea dinámica, igual que en 'wildcards'
export const dynamic = "force-dynamic";

type SugerenciaConPerfil = Sugerencia & {
  user: {
    id: string;
    email: string;
    profile: {
      nombres: string | null;
      apellidoPaterno: string | null;
    } | null;
  } | null;
};

// 1. Tipado explícito de 'searchParams', IGUAL QUE EN WILDCARDS
type Props = {
  searchParams?: Promise<{
    q?: string;
    userId?: string;
    estado?: string;
    from?: string;
    to?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Props["searchParams"];
}) {
  
  // 2. Usamos 'await' y leemos 'sp', IGUAL QUE EN WILDCARDS
  const sp = await searchParams;

  const search = sp?.q?.trim() || "";
  const userId = sp?.userId || "";
  const estado = sp?.estado || "all";
  const from = sp?.from || "";
  const to = sp?.to || "";
  const page = sp?.page ? parseInt(sp.page, 10) : 1;
  const pageSize = sp?.pageSize ? parseInt(sp.pageSize, 10) : 20;
  
  // 3. Construir filtros 'where'
  const where: Prisma.SugerenciaWhereInput = {};
  
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

  // --- INICIO DE LA CORRECCIÓN ---
  // 4. Creamos un 'where' separado para el conteo (groupBy)
  //    Hacemos una copia superficial del objeto 'where'
  const groupByWhere: Prisma.SugerenciaWhereInput = { ...where };
  
  //    Eliminamos la propiedad 'estado' de la copia.
  //    El 'where' original (para la lista y el conteo total) aún la tiene.
  delete groupByWhere.estado; 
  // --- FIN DE LA CORRECCIÓN ---

  // 5. Llamar a Prisma directamente (igual que en 'wildcards')
  const [total, sugerencias, countByEstadoRaw] = await Promise.all([
    prisma.sugerencia.count({ where }), // La cuenta total SÍ usa el 'where' completo
    prisma.sugerencia.findMany({
      where, // El listado SÍ usa el 'where' completo
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
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    // El conteo por pestañas usa el 'groupByWhere' (la copia sin 'estado')
    prisma.sugerencia.groupBy({
      by: ['estado'],
      _count: true,
      where: groupByWhere, 
    }),
  ]);
  
  const totalPages = Math.ceil(total / pageSize);

  const countByEstado = countByEstadoRaw.reduce((acc, item) => {
    acc[item.estado] = item._count;
    return acc;
  }, {} as Record<string, number>);

  // (El resto del código es idéntico y correcto)
  const sugerenciasRows = (sugerencias as SugerenciaConPerfil[]).map((s) => {
    const userName = s.user?.profile
      ? [s.user.profile.nombres, s.user.profile.apellidoPaterno].filter(Boolean).join(" ")
      : null;

    return {
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      user: s.user
        ? { id: s.user.id, nombres: userName || s.user.email, email: s.user.email }
        : { id: null, nombres: s.nombre, email: s.email },
      asunto: s.asunto,
      estado: s.estado,
      mensaje: s.mensaje,
      notaPrivada: s.notaPrivada,
    };
  });

  const params = {
    q: search,
    userId: userId,
    estado: estado,
    from: from,
    to: to,
    page: page.toString(),
    pageSize: pageSize.toString(),
  };

  const filterDefaults = {
    q: search,
    userId: userId,
    estado: estado,
    from: from,
    to: to,
    page,
    pageSize,
  };

  const pagination = { page, pageSize, total, totalPages };

  const usersWithProfile = await prisma.user.findMany({
    where: { 
      isActive: true,
      profile: {
        nombres: { not: null }
      }
    },
    select: { 
      id: true, 
      profile: {
        select: {
          nombres: true,
          apellidoPaterno: true
        }
      } 
    },
    orderBy: { 
      profile: {
        nombres: "asc" 
      }
    },
  });
  
  const users = usersWithProfile.map(u => ({
    id: u.id,
    nombres: [u.profile?.nombres, u.profile?.apellidoPaterno].filter(Boolean).join(" ")
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">Sugerencias</h1>
      <SugerenciasPageWrapper
        rows={sugerenciasRows}
        pagination={pagination}
        filterDefaults={filterDefaults}
        stats={countByEstado}
        searchParams={params}
        users={users}
      />
    </div>
  );
}