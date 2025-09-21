import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import ReviewButtons from "@/components/admin/wildcards/ReviewButtons";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
    status?: "all" | "pending" | "approved" | "rejected";
  }>;
};

export default async function WildcardsAdminPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp?.q?.trim() || "";
  const statusParam = (sp?.status || "all").toUpperCase() as "ALL" | "PENDING" | "APPROVED" | "REJECTED";
  const page = Math.max(1, parseInt(sp?.page || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(sp?.pageSize || "20", 10)));
  const skip = (page - 1) * pageSize;

  const where: Prisma.WildcardWhereInput = {};
  if (q) {
    where.OR = [
      { nombreArtistico: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { nombres: { contains: q, mode: "insensitive" } } },
      { user: { apellidoPaterno: { contains: q, mode: "insensitive" } } },
      { user: { apellidoMaterno: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (statusParam !== "ALL") where.status = statusParam as any;

  const [total, items] = await Promise.all([
    prisma.wildcard.count({ where }),
    prisma.wildcard.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, nombres: true, apellidoPaterno: true, apellidoMaterno: true } },
        reviewedBy: { select: { id: true, email: true, nombres: true } },
      },
      orderBy: { id: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (pageSize !== 20) params.set("pageSize", String(pageSize));
    if (statusParam !== "ALL") params.set("status", statusParam.toLowerCase());
    params.set("page", String(p));
    return `/admin/wildcards?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Wildcards</h2>
        <form method="GET" action="/admin/wildcards" className="flex items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por alias o usuario"
            className="border rounded px-3 py-2 text-sm w-64"
          />
          <select name="status" defaultValue={statusParam.toLowerCase()} className="border rounded px-2 py-2 text-sm">
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
          <select name="pageSize" defaultValue={String(pageSize)} className="border rounded px-2 py-2 text-sm">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <button className="border rounded px-3 py-2 text-sm bg-white hover:bg-gray-50" type="submit">
            Aplicar
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Alias</th>
              <th className="text-left p-3">Usuario</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Revisado por</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((w) => {
              const nombreUsuario = [w.user?.nombres, w.user?.apellidoPaterno, w.user?.apellidoMaterno]
                .filter(Boolean)
                .join(" ");
              return (
                <tr key={w.id} className="border-t">
                  <td className="p-3">{w.nombreArtistico || "—"}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{nombreUsuario || "—"}</span>
                      <span className="text-xs text-gray-500">{w.user?.email || "—"}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                        w.status === "APPROVED"
                          ? "bg-green-50 text-green-700"
                          : w.status === "REJECTED"
                          ? "bg-red-50 text-red-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {w.reviewedBy ? (
                      <span className="text-xs text-gray-700">{w.reviewedBy.nombres || w.reviewedBy.email}</span>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <a href={`/admin/wildcards/${w.id}`} className="text-blue-600 hover:underline">Ver</a>
                      <ReviewButtons id={w.id} status={w.status as any} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  No se encontraron wildcards.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Mostrando {items.length} de {total} wildcards</div>
        <div className="flex items-center gap-2">
          <a
            href={buildPageUrl(Math.max(1, page - 1))}
            className={`px-3 py-1.5 border rounded text-sm ${
              page === 1 ? "pointer-events-none opacity-50" : "bg-white hover:bg-gray-50"
            }`}
          >
            Anterior
          </a>
          <span className="text-sm">Página {page} de {totalPages}</span>
          <a
            href={buildPageUrl(Math.min(totalPages, page + 1))}
            className={`px-3 py-1.5 border rounded text-sm ${
              page >= totalPages ? "pointer-events-none opacity-50" : "bg-white hover:bg-gray-50"
            }`}
          >
            Siguiente
          </a>
        </div>
      </div>
    </div>
  );
}