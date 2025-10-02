import { ensureAdminPage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getCompras } from "./actions";
import ComprasFilters from "@/components/admin/compras/ComprasFilters";
import ComprasTable from "@/components/admin/compras/ComprasTable";

type SearchParamsType = {
  q?: string;
  eventId?: string;
  tipo?: string;
  from?: string;
  to?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
};

export default async function ComprasPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsType>;
}) {
  await ensureAdminPage();

  const params = await searchParams;

  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 20;

  const events = await prisma.evento.findMany({
    where: { compras: { some: {} } },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" }
  });

  const sort =
    params.sort === "fecha_asc"
      ? "fecha_asc"
      : params.sort === "total_desc"
      ? "total_desc"
      : params.sort === "total_asc"
      ? "total_asc"
      : "fecha_desc";

  const { compras, total, stats, totalPages } = await getCompras({
    search: params.q,
    eventId: params.eventId,
    tipo: params.tipo,
    from: params.from,
    to: params.to,
    page,
    pageSize,
    sort: params.sort
  });

  const defaults = {
    q: params.q,
    eventId: params.eventId,
    tipo: params.tipo,
    from: params.from,
    to: params.to,
    pageSize
  };

  const pagination = { page, pageSize, total, totalPages, sort };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Compras</h1>

      <ComprasFilters events={events} defaults={defaults} sort={sort as any} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-700">Ingresos brutos</h3>
          <p className="text-2xl font-bold">
            ${stats.ingresosBrutos.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-700">Entradas vendidas</h3>
          <p className="text-2xl font-bold">{stats.entradasVendidas}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-700">Por tipo</h3>
          {Object.entries(stats.porTipo).map(([tipo, data]) => (
            <div key={tipo} className="flex justify-between">
              <span>
                {tipo}: {data.cantidad}
              </span>
              <span>${data.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <ComprasTable rows={compras} pagination={pagination} />
    </div>
  );
}