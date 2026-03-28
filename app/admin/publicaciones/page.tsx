import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma, PublicationStatus, PublicationType } from "@prisma/client";
import { NewspaperIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

function toInt(v: string | undefined, def: number) {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

type Props = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
    tipo?: "all" | PublicationType;
    estado?: "all" | PublicationStatus;
  }>;
};

export default async function AdminPublicacionesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp?.q?.trim() || "";
  const tipo = sp?.tipo || "all";
  const estado = sp?.estado || "all";
  const page = toInt(sp?.page, 1);
  const pageSize = Math.min(100, toInt(sp?.pageSize, 20));
  const skip = (page - 1) * pageSize;

  const where: Prisma.PublicacionWhereInput = {};
  if (q) {
    where.OR = [
      { titulo: { contains: q, mode: "insensitive" } },
      { descripcion: { contains: q, mode: "insensitive" } },
      { autor: { contains: q, mode: "insensitive" } },
    ];
  }
  if (tipo !== "all") where.tipo = tipo;
  if (estado !== "all") where.estado = estado;

  const [total, data] = await Promise.all([
    prisma.publicacion.count({ where }),
    prisma.publicacion.findMany({
      where,
      orderBy: [{ fecha: "desc" }],
      skip,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildPageUrl = (p: number) =>
    `/admin/publicaciones?${new URLSearchParams({
      q,
      tipo,
      estado,
      page: String(p),
      pageSize: String(pageSize),
    }).toString()}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-white">Publicaciones</h1>
        <Link
          href="/admin/publicaciones/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow-lg hover:from-green-700 hover:to-green-600 transition"
        >
          <NewspaperIcon className="w-5 h-5" />
          Nueva publicacion
        </Link>
      </div>

      <form
        className="flex flex-wrap items-center gap-2 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 rounded-xl shadow-lg px-4 py-2"
        action="/admin/publicaciones"
      >
        <input
          name="q"
          placeholder="Buscar por titulo, descripcion o autor"
          className="input input-bordered w-40 sm:w-64 bg-blue-950/50 border-blue-700/50 text-white placeholder:text-blue-300/70 focus:border-blue-500"
          defaultValue={q}
        />
        <select
          name="tipo"
          defaultValue={tipo}
          className="select select-bordered bg-blue-950/50 border-blue-700/50 text-white focus:border-blue-500"
        >
          <option value="all">Todos los tipos</option>
          <option value={PublicationType.blog}>Blog</option>
          <option value={PublicationType.noticia}>Noticia</option>
        </select>
        <select
          name="estado"
          defaultValue={estado}
          className="select select-bordered bg-blue-950/50 border-blue-700/50 text-white focus:border-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value={PublicationStatus.borrador}>Borrador</option>
          <option value={PublicationStatus.publicado}>Publicado</option>
          <option value={PublicationStatus.archivado}>Archivado</option>
        </select>
        <button
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition"
          type="submit"
        >
          Filtrar
        </button>
      </form>

      <div className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-900/50 text-blue-200 border-b border-blue-700/30">
            <tr>
              <th className="text-left p-5 font-semibold">Titulo</th>
              <th className="text-left p-5 font-semibold">Tipo</th>
              <th className="text-left p-5 font-semibold">Fecha</th>
              <th className="text-left p-5 font-semibold">Estado</th>
              <th className="text-left p-5 font-semibold">Autor</th>
              <th className="text-right p-5 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-blue-700/20 last:border-b-0 hover:bg-blue-800/30 transition">
                <td className="p-5 font-medium text-white">{item.titulo}</td>
                <td className="p-5 text-white capitalize">{item.tipo}</td>
                <td className="p-5 text-white">
                  {new Date(item.fecha).toLocaleString("es-CL", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="p-5 text-white capitalize">{item.estado}</td>
                <td className="p-5 text-white">{item.autor}</td>
                <td className="p-5 text-right">
                  <Link
                    href={`/admin/publicaciones/${item.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/50 text-blue-200 hover:bg-blue-600/70 border border-blue-500/30 font-semibold transition"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-blue-300/70">
                  No hay publicaciones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <span className="text-blue-200">
          Mostrando pagina {page} de {totalPages} - Total: {total}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={buildPageUrl(Math.max(1, page - 1))}
            className={`btn btn-sm ${page === 1 ? "btn-disabled opacity-50" : "bg-blue-600/50 text-blue-200 border-blue-500/30 hover:bg-blue-600/70"}`}
          >
            Anterior
          </Link>
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
