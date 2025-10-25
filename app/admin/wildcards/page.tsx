import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import ReviewButtons from "@/components/admin/wildcards/ReviewButtons";
import { UserIcon, FunnelIcon, EyeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

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
      { user: { profile: { nombres: { contains: q, mode: "insensitive" } } } },
      { user: { profile: { apellidoPaterno: { contains: q, mode: "insensitive" } } } },
      { user: { profile: { apellidoMaterno: { contains: q, mode: "insensitive" } } } },
    ];
  }
  if (statusParam !== "ALL") where.status = statusParam as any;

  const [total, items] = await Promise.all([
    prisma.wildcard.count({ where }),
    prisma.wildcard.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { nombres: true, apellidoPaterno: true, apellidoMaterno: true },
            },
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { nombres: true, apellidoPaterno: true },
            },
          },
        },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Wildcards</h2>
          <form method="GET" action="/admin/wildcards" className="flex flex-wrap items-center gap-2 bg-white rounded-xl shadow px-4 py-2 border border-gray-200">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por alias o usuario"
              className="input input-bordered w-40 sm:w-64 bg-gray-50 border-gray-200 focus:border-indigo-400"
            />
            <select name="status" defaultValue={statusParam.toLowerCase()} className="select select-bordered bg-gray-50 border-gray-200 focus:border-indigo-400">
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
            <select name="pageSize" defaultValue={String(pageSize)} className="select select-bordered bg-gray-50 border-gray-200 focus:border-indigo-400">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <button
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
              type="submit"
            >
              <FunnelIcon className="w-5 h-5" /> Aplicar
            </button>
          </form>
        </div>

        {/* Tabla desktop */}
        <div className="hidden md:block rounded-2xl shadow bg-white border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-5 font-semibold">Alias</th>
                <th className="text-left p-5 font-semibold">Usuario</th>
                <th className="text-left p-5 font-semibold">Estado</th>
                <th className="text-left p-5 font-semibold">Revisado por</th>
                <th className="text-right p-5 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((w) => {
                const nombreUsuario = [w.user?.profile?.nombres, w.user?.profile?.apellidoPaterno, w.user?.profile?.apellidoMaterno]
                  .filter(Boolean)
                  .join(" ");
                const nombreRevisor = w.reviewedBy
                  ? [w.reviewedBy.profile?.nombres, w.reviewedBy.profile?.apellidoPaterno]
                      .filter(Boolean)
                      .join(" ") || w.reviewedBy.email // Fallback al email
                  : null;

                return (
                  <tr key={w.id} className="border-b last:border-b-0 hover:bg-indigo-50/30 transition">
                    <td className="p-5">{w.nombreArtistico || "—"}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-400 font-bold text-lg border-2 border-indigo-200 shadow">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">{nombreUsuario || "—"}</div>
                          <div className="text-xs text-gray-500">{w.user?.email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          w.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : w.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="p-5">
                      {w.reviewedBy ? (
                        <span className="text-xs text-gray-700">{nombreRevisor}</span>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/wildcards/${w.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition"
                          title="Ver wildcard"
                        >
                          <EyeIcon className="w-4 h-4" /> Ver
                        </Link>
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

        {/* Lista mobile */}
        <div className="md:hidden space-y-4">
          {items.map((w) => {
            const nombreUsuario = [w.user?.profile?.nombres, w.user?.profile?.apellidoPaterno, w.user?.profile?.apellidoMaterno]
              .filter(Boolean)
              .join(" ");
            const nombreRevisor = w.reviewedBy
              ? [w.reviewedBy.profile?.nombres, w.reviewedBy.profile?.apellidoPaterno]
                  .filter(Boolean)
                  .join(" ") || w.reviewedBy.email // Fallback al email
              : null;

            return (
              <div key={w.id} className="rounded-2xl shadow bg-white border border-gray-200 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-400 font-bold text-lg border-2 border-indigo-200 shadow">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{nombreUsuario || "—"}</div>
                    <div className="text-xs text-gray-500">{w.user?.email || "—"}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Alias: {w.nombreArtistico || "—"}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      w.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : w.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {w.status}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span>
                    {nombreRevisor || "Sin revisión"}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link
                    href={`/admin/wildcards/${w.id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition flex-1"
                  >
                    <EyeIcon className="w-4 h-4" /> Ver
                  </Link>
                  <ReviewButtons id={w.id} status={w.status as any} />
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow border border-gray-200">
              No se encontraron wildcards.
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-gray-600">Mostrando {items.length} de {total} wildcards</div>
          <div className="flex items-center gap-2">
            <Link
              href={buildPageUrl(Math.max(1, page - 1))}
              className={`btn btn-sm ${page === 1 ? "btn-disabled" : "btn-outline"}`}
            >
              Anterior
            </Link>
            <span className="text-sm">Página {page} de {totalPages}</span>
            <Link
              href={buildPageUrl(Math.min(totalPages, page + 1))}
              className={`btn btn-sm ${page >= totalPages ? "btn-disabled" : "btn-outline"}`}
            >
              Siguiente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}