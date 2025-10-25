import SugerenciasPageWrapper from "@/components/admin/sugerencias/SugerenciasPageWrapper";
import { getSugerencias } from "./actions";
import { prisma } from "@/lib/prisma"; 
import { Sugerencia, User } from "@prisma/client";

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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const paramsObj = await searchParams;

  const params = {
    q: typeof paramsObj.q === "string" ? paramsObj.q : undefined,
    userId: typeof paramsObj.userId === "string" ? paramsObj.userId : undefined,
    estado: typeof paramsObj.estado === "string" ? paramsObj.estado : undefined,
    from: typeof paramsObj.from === "string" ? paramsObj.from : undefined,
    to: typeof paramsObj.to === "string" ? paramsObj.to : undefined,
    page: typeof paramsObj.page === "string" ? paramsObj.page : undefined,
    pageSize: typeof paramsObj.pageSize === "string" ? paramsObj.pageSize : undefined,
  };

  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 20;

  const { sugerencias, total, countByEstado, totalPages } = await getSugerencias({
    search: params.q,
    userId: params.userId,
    estado: params.estado,
    from: params.from,
    to: params.to,
    page,
    pageSize,
  });

  // Mapeo para la tabla
  const sugerenciasRows = (sugerencias as SugerenciaConPerfil[]).map((s) => {
    const userName = s.user?.profile
      ? [s.user.profile.nombres, s.user.profile.apellidoPaterno].filter(Boolean).join(" ")
      : null;

    return {
      id: s.id,
      createdAt: s.createdAt,
      user: s.user
        ? { id: s.user.id, nombres: userName || s.user.email, email: s.user.email }
        : { id: null, nombres: s.nombre, email: s.email },
      asunto: s.asunto,
      estado: s.estado,
      mensaje: s.mensaje,
      notaPrivada: s.notaPrivada,
    };
  });

  const filterDefaults = {
    q: params.q,
    userId: params.userId,
    estado: params.estado,
    from: params.from,
    to: params.to,
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
    <SugerenciasPageWrapper
      rows={sugerenciasRows}
      pagination={pagination}
      filterDefaults={filterDefaults}
      stats={countByEstado}
      searchParams={params}
      users={users}
    />
  );
}