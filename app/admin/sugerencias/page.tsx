import { ensureAdminPage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSugerencias } from "./actions";
import SugerenciasFilters from "@/components/admin/sugerencias/SugerenciasFilters";
import SugerenciasTable from "@/components/admin/sugerencias/SugerenciasTable";

// Opcional: fuerza que esta ruta se trate como dinámica (si necesitas siempre datos frescos)
// export const dynamic = "force-dynamic";

type SearchParamsType = {
  q?: string;
  userId?: string;
  estado?: string;
  from?: string;
  to?: string;
  page?: string;
  pageSize?: string;
};

export default async function SugerenciasPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsType>;
}) {
  await ensureAdminPage();

  // Esperar la Promise
  const params = await searchParams;

  // Parse numéricos
  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 20;

  // Datos para selects
  const users = await prisma.user.findMany({
    where: { sugerencias: { some: {} } },
    select: { id: true, nombres: true },
    orderBy: { nombres: "asc" }
  });

  // Llamada Server Action
  const { sugerencias, total, countByEstado, totalPages } = await getSugerencias({
    search: params.q,
    userId: params.userId,
    estado: params.estado,
    from: params.from,
    to: params.to,
    page,
    pageSize
  });

  const defaults = {
    q: params.q,
    userId: params.userId,
    estado: params.estado,
    from: params.from,
    to: params.to,
    pageSize
  };

  const pagination = { page, pageSize, total, totalPages };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Sugerencias</h1>

      <SugerenciasFilters users={users} defaults={defaults} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-700">Total sugerencias</h3>
            <p className="text-2xl font-bold">{total}</p>
        </div>
        {Object.entries(countByEstado || {}).map(([estado, count]) => (
          <div key={estado} className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <h3 className="font-semibold text-gray-700">
              {estado === "nuevo"
                ? "Nuevas"
                : estado === "revisado"
                ? "Revisadas"
                : estado === "descartado"
                ? "Descartadas"
                : estado}
            </h3>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      <SugerenciasTable rows={sugerencias} pagination={pagination} />
    </div>
  );
}