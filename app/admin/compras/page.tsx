import ComprasPageWrapper from "@/components/admin/compras/ComprasPageWrapper";
import { getCompras, getCompraById } from "./actions";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const paramsObj = await searchParams;

  // Adaptar searchParams a SearchParamsType
  const params = {
    q: typeof paramsObj.q === "string" ? paramsObj.q : undefined,
    eventId: typeof paramsObj.eventId === "string" ? paramsObj.eventId : undefined,
    tipo: typeof paramsObj.tipo === "string" ? paramsObj.tipo : undefined,
    from: typeof paramsObj.from === "string" ? paramsObj.from : undefined,
    to: typeof paramsObj.to === "string" ? paramsObj.to : undefined,
    page: typeof paramsObj.page === "string" ? paramsObj.page : undefined,
    pageSize: typeof paramsObj.pageSize === "string" ? paramsObj.pageSize : undefined,
    sort: typeof paramsObj.sort === "string" ? paramsObj.sort : undefined,
  };

  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 20;
  const sort = params.sort ?? "fecha_desc";

  const { compras, total, stats, totalPages } = await getCompras({
    search: params.q,
    eventId: params.eventId,
    tipo: params.tipo,
    from: params.from,
    to: params.to,
    page,
    pageSize,
    sort,
  });

  // Mapeo para la tabla
  const comprasRows = compras.map((c: any) => ({
    id: c.id,
    createdAt: c.createdAt,
    userNombre: c.userNombre,
    userEmail: c.userEmail,
    eventoId: c.eventoId,
    eventoNombre: c.eventoNombre,
    eventoFecha: c.eventoFecha,
    tipoEntrada: c.tipoEntrada,
    cantidad: c.cantidad,
    precioUnitario: c.precioUnitario,
    total: c.total,
  }));

  // Para los filtros de eventos
  const events = comprasRows
    .map((c: any) => ({
      id: c.eventoId,
      nombre: c.eventoNombre,
    }))
    .filter(
      (v: any, i: number, arr: any[]) =>
        arr.findIndex((x) => x.id === v.id) === i
    );

  const filterDefaults = {
    q: params.q,
    eventId: params.eventId,
    tipo: params.tipo,
    from: params.from,
    to: params.to,
    page,
    pageSize,
    sort,
  };

  const pagination = { page, pageSize, total, totalPages, sort };

  return (
    <ComprasPageWrapper
      searchParams={params}
      comprasData={comprasRows}
      events={events}
      stats={stats}
      pagination={pagination}
      filterDefaults={filterDefaults}
    />
  );
}