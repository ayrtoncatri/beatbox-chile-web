import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import ReviewButtons from "@/components/admin/wildcards/ReviewButtons";
import { UserIcon, FunnelIcon, EyeIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
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
        inscripcion: {
          select: { id: true } // Solo necesitamos saber si existe
        },
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
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-white">Wildcards</h2>
          <form method="GET" action="/admin/wildcards" className="flex flex-wrap items-center gap-2 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 rounded-xl shadow-lg px-4 py-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por alias o usuario"
              className="input input-bordered w-40 sm:w-64 bg-blue-950/50 border-blue-700/50 text-white placeholder:text-blue-300/70 focus:border-blue-500"
            />
            <select name="status" defaultValue={statusParam.toLowerCase()} className="select select-bordered bg-blue-950/50 border-blue-700/50 text-white focus:border-blue-500">
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
            <select name="pageSize" defaultValue={String(pageSize)} className="select select-bordered bg-blue-950/50 border-blue-700/50 text-white focus:border-blue-500">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <button
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition"
              type="submit"
            >
              <FunnelIcon className="w-5 h-5" /> Aplicar
            </button>
          </form>
        </div>

        {/* Tabla desktop */}
        <div className="hidden md:block rounded-2xl shadow-lg bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-900/50 text-blue-200 border-b border-blue-700/30">
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

                const isInscrito = w.inscripcion !== null;

                return (
                  <tr key={w.id} className="border-b border-blue-700/20 last:border-b-0 hover:bg-blue-800/30 transition">
                    <td className="p-5 text-white">
                      {w.nombreArtistico || "—"}
                      {isInscrito && (
                        <CheckBadgeIcon className="w-4 h-4 inline-block ml-1 text-blue-400" title="Inscripción creada" />
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 font-bold text-lg border-2 border-blue-500/50 shadow">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{nombreUsuario || "—"}</div>
                          <div className="text-xs text-blue-300/70">{w.user?.email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                          w.status === "APPROVED"
                            ? "bg-green-900/50 text-green-300 border-green-700/30"
                            : w.status === "REJECTED"
                            ? "bg-red-900/50 text-red-300 border-red-700/30"
                            : "bg-yellow-900/50 text-yellow-300 border-yellow-700/30"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="p-5">
                      {w.reviewedBy ? (
                        <span className="text-xs text-white">{nombreRevisor}</span>
                      ) : (
                        <span className="text-xs text-blue-300/70">—</span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/wildcards/${w.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/50 text-blue-200 hover:bg-blue-600/70 border border-blue-500/30 font-semibold transition"
                          title="Ver wildcard"
                        >
                          <EyeIcon className="w-4 h-4" /> Ver
                        </Link>
                        {/* 'ReviewButtons' ahora devuelve 1 o 2 elementos
                            que 'flex' y 'gap-2' alinearán perfectamente */}
                        <ReviewButtons id={w.id} status={w.status as any} isInscrito={isInscrito} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-blue-300/70" colSpan={5}>
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

            const isInscrito = w.inscripcion !== null;

            return (
              <div key={w.id} className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 font-bold text-lg border-2 border-blue-500/50 shadow">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{nombreUsuario || "—"}</div>
                    <div className="text-xs text-blue-300/70">{w.user?.email || "—"}</div>
                  </div>
                </div>
                <div className="text-xs text-white">
                  Alias: {w.nombreArtistico || "—"}
                  {isInscrito && (
                    <CheckBadgeIcon className="w-4 h-4 inline-block ml-1 text-blue-400" title="Inscripción creada" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                      w.status === "APPROVED"
                        ? "bg-green-900/50 text-green-300 border-green-700/30"
                        : w.status === "REJECTED"
                        ? "bg-red-900/50 text-red-300 border-red-700/30"
                        : "bg-yellow-900/50 text-yellow-300 border-yellow-700/30"
                    }`}
                  >
                    {w.status}
                  </span>
                  <span className="text-blue-400">|</span>
                  <span className="text-white">
                    {nombreRevisor || "Sin revisión"}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link
                    href={`/admin/wildcards/${w.id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-blue-600/50 text-blue-200 hover:bg-blue-600/70 border border-blue-500/30 font-semibold transition flex-1"
                  >
                    <EyeIcon className="w-4 h-4" /> Ver
                  </Link>
                  <ReviewButtons id={w.id} status={w.status as any} isInscrito={isInscrito} />
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="p-6 text-center text-blue-300/70 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 rounded-xl shadow-lg">
              No se encontraron wildcards.
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-blue-200">Mostrando {items.length} de {total} wildcards</div>
          <div className="flex items-center gap-2">
            <Link
              href={buildPageUrl(Math.max(1, page - 1))}
              className={`btn btn-sm ${page === 1 ? "btn-disabled opacity-50" : "bg-blue-600/50 text-blue-200 border-blue-500/30 hover:bg-blue-600/70"}`}
            >
              Anterior
            </Link>
            <span className="text-sm text-blue-200">Página {page} de {totalPages}</span>
            <Link
              href={buildPageUrl(Math.min(totalPages, page + 1))}
              className={`btn btn-sm ${page >= totalPages ? "btn-disabled opacity-50" : "bg-blue-600/50 text-blue-200 border-blue-500/30 hover:bg-blue-600/70"}`}
            >
              Siguiente
            </Link>
          </div>
        </div>
    </div>
  );
}