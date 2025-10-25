import ComprasPageWrapper from "@/components/admin/compras/ComprasPageWrapper";
import { getCompras } from "./actions";

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
    userNombre: [
      c.user?.profile?.nombres,
      c.user?.profile?.apellidoPaterno,
      c.user?.profile?.apellidoMaterno,
    ].filter(Boolean).join(" "),
    userEmail: c.user?.email,
    comuna: c.user?.profile?.comuna?.name,
    region: c.user?.profile?.comuna?.region?.name,
    eventoId: c.evento?.id,
    eventoNombre: c.evento?.nombre,
    eventoFecha: c.evento?.fecha,
    eventoTipo: c.evento?.tipo?.name,
    eventoVenue: c.evento?.venue?.name,
    items: c.items.map((i: any) => ({
      tipoEntrada: i.ticketType.name,
      cantidad: i.quantity,
      precioUnitario: i.unitPrice,
      total: i.subtotal,
    })),
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