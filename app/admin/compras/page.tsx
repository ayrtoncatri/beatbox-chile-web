import { prisma } from "@/lib/prisma";
import ComprasFilters from "@/components/admin/compras/ComprasFilters";
import ComprasTable from "@/components/admin/compras/ComprasTable";
import CompraDetailDrawer from "@/components/admin/compras/CompraDetailDrawer";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseNumber(v: string | undefined, def: number) {
  const n = Number(v);
  return isNaN(n) ? def : n;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const q = (sp.q as string) || undefined;
  const eventId = (sp.eventId as string) || undefined;
  const tipo = (sp.tipo as string) || undefined;
  const from = sp.from ? new Date(sp.from as string) : undefined;
  const to = sp.to ? new Date(sp.to as string) : undefined;
  const page = Math.max(1, parseNumber(sp.page as string, 1));
  const pageSize = Math.min(100, Math.max(1, parseNumber(sp.pageSize as string, 20)));
  const sort = ((sp.sort as string) || "fecha_desc") as
    | "fecha_desc"
    | "fecha_asc"
    | "total_desc"
    | "total_asc";

  const where: any = {
    AND: [
      q
        ? {
            OR: [
              { userNombre: { contains: q, mode: "insensitive" } },
              { userEmail: { contains: q, mode: "insensitive" } },
              { eventoNombre: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      eventId ? { eventoId: eventId } : {},
      tipo ? { tipoEntrada: tipo } : {},
      from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {},
    ],
  };

  const orderBy =
  sort === "fecha_asc"
    ? { createdAt: "asc" as const }
    : sort === "total_desc"
    ? { total: "desc" as const }
    : sort === "total_asc"
    ? { total: "asc" as const }
    : { createdAt: "desc" as const };

  const [events, total, rows, agg, aggGen, aggVip] = await Promise.all([
    prisma.evento.findMany({ select: { id: true, nombre: true }, orderBy: { fecha: "desc" } }),
    prisma.compraEntrada.count({ where }),
    prisma.compraEntrada.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        createdAt: true,
        userNombre: true,
        userEmail: true,
        eventoId: true,
        eventoNombre: true,
        eventoFecha: true,
        tipoEntrada: true,
        cantidad: true,
        precioUnitario: true,
        total: true,
      },
    }),
    prisma.compraEntrada.aggregate({
      where,
      _sum: { cantidad: true, total: true },
      _count: { _all: true },
    }),
    prisma.compraEntrada.aggregate({
      where: { AND: [where, { tipoEntrada: "General" }] },
      _sum: { cantidad: true, total: true },
    }),
    prisma.compraEntrada.aggregate({
      where: { AND: [where, { tipoEntrada: "VIP" }] },
      _sum: { cantidad: true, total: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const summary = {
    totalCompras: agg._count?._all || 0,
    entradasVendidas: agg._sum?.cantidad || 0,
    ingresosBrutos: agg._sum?.total || 0,
    porTipo: {
      General: { entradas: aggGen._sum?.cantidad || 0, ingresos: aggGen._sum?.total || 0 },
      VIP: { entradas: aggVip._sum?.cantidad || 0, ingresos: aggVip._sum?.total || 0 },
    },
  };

  const exportUrl = `/api/admin/compras/export?${new URLSearchParams(
    Object.fromEntries(
      Object.entries({
        q,
        eventId,
        tipo,
        from: from?.toISOString(),
        to: to?.toISOString(),
        sort,
      }).filter(([, v]) => v)
    ) as any
  ).toString()}`;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Compras</h1>

      <ComprasFilters
        events={events}
        defaults={{ q, eventId, tipo, from: (sp.from as string) || "", to: (sp.to as string) || "", pageSize }}
        exportUrl={exportUrl}
        sort={sort}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded border">
          <div className="text-sm text-gray-500">Ingresos brutos</div>
          <div className="text-xl font-bold">${summary.ingresosBrutos.toLocaleString("es-CL")}</div>
        </div>
        <div className="p-4 rounded border">
          <div className="text-sm text-gray-500">Entradas vendidas</div>
          <div className="text-xl font-bold">{summary.entradasVendidas}</div>
        </div>
        <div className="p-4 rounded border">
          <div className="text-sm text-gray-500">Nº de compras</div>
          <div className="text-xl font-bold">{summary.totalCompras}</div>
        </div>
        <div className="p-4 rounded border">
          <div className="text-sm text-gray-500">Por tipo</div>
          <div className="text-sm">
            General: {summary.porTipo.General.entradas} (${summary.porTipo.General.ingresos.toLocaleString("es-CL")})<br />
            VIP: {summary.porTipo.VIP.entradas} (${summary.porTipo.VIP.ingresos.toLocaleString("es-CL")})
          </div>
        </div>
      </div>

      <ComprasTable
        rows={rows}
        pagination={{ page, pageSize, total, totalPages, sort }}
      />

      <div className="flex items-center justify-between pt-4">
        <a
          className={`btn btn-secondary ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
          href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, String(v)])), page: String(page - 1) })}`}
        >
          Anterior
        </a>
        <div>Página {page} de {totalPages}</div>
        <a
          className={`btn btn-secondary ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
          href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, String(v)])), page: String(page + 1) })}`}
        >
          Siguiente
        </a>
      </div>

      <CompraDetailDrawer />
    </div>
  );
}