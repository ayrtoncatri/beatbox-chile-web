import SugerenciasPageWrapper from "@/components/admin/sugerencias/SugerenciasPageWrapper";
import { getSugerencias } from "./actions";
import { prisma } from "@/lib/prisma"; 

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
  const sugerenciasRows = sugerencias.map((s: any) => ({
    id: s.id,
    createdAt: s.createdAt,
    user: s.user
      ? { id: s.user.id, nombres: s.user.nombres, email: s.user.email }
      : { id: null, nombres: s.nombre, email: s.email },
    asunto: s.asunto,
    estado: s.estado,
    mensaje: s.mensaje,
    notaPrivada: s.notaPrivada,
  }));

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

  // --- NUEVO: obtener usuarios para el filtro ---
  const users = await prisma.user.findMany({
    select: { id: true, nombres: true },
    orderBy: { nombres: "asc" },
    where: { isActive: true },
  });

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