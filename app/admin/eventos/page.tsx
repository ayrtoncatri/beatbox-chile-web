import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  CalendarDaysIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  TicketIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { Prisma } from "@prisma/client"; 

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
    status?: "all" | "published" | "draft";
  }>;
};

export default async function AdminEventosPage({ searchParams }: Props) {

  const sp = await searchParams;

  const q = sp?.q?.trim() || "";
  const status = sp?.status || "all";
  const page = toInt(sp?.page, 1);
  const pageSize = Math.min(100, toInt(sp?.pageSize, 20));
  const skip = (page - 1) * pageSize;

  // --- CAMBIO: 'where' adaptado a los modelos relacionados ---
  const where: Prisma.EventoWhereInput = {}; // Usamos el tipo de Prisma
  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: "insensitive" } },
      { descripcion: { contains: q, mode: "insensitive" } },
      // Buscar en el nombre del Venue (lugar)
      { venue: { name: { contains: q, mode: "insensitive" } } },
      // Buscar en el nombre de la Comuna (ciudad)
      {
        venue: {
          address: { comuna: { name: { contains: q, mode: "insensitive" } } },
        },
      },
    ];
  }
  if (status === "published") where.isPublished = true;
  if (status === "draft") where.isPublished = false;

  const [total, data] = await Promise.all([
    prisma.evento.count({ where }),
    prisma.evento.findMany({
      where,
      orderBy: [{ fecha: "desc" }],
      skip,
      take: pageSize,
      // --- CAMBIO: Reemplazamos 'select' por 'include' ---
      include: {
        venue: {
          include: {
            address: {
              include: {
                comuna: {
                  select: { name: true }, // Solo necesitamos el nombre de la comuna
                },
              },
            },
          },
        },
      },
      // El 'select' anterior fue eliminado
    }),
  ]);

  const pagination = {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };

  const buildPageUrl = (p: number) =>
    `/admin/eventos?${new URLSearchParams({
      q,
      status,
      page: String(p),
      pageSize: String(pageSize),
    }).toString()}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ... (Botón "Nuevo evento" y Formulario de búsqueda no cambian) ... */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Eventos
          </h1>
          <Link
            href="/admin/eventos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
          >
            <CalendarDaysIcon className="w-5 h-5" />
            Nuevo evento
          </Link>
        </div>

        <form
          className="flex flex-wrap items-center gap-2 bg-white rounded-xl shadow px-4 py-2 border border-gray-200 mb-4"
          action="/admin/eventos"
        >
          <input
            name="q"
            placeholder="Buscar por nombre, ciudad o lugar"
            className="input input-bordered w-40 sm:w-64 bg-gray-50 border-gray-200 focus:border-indigo-400"
            defaultValue={q}
          />
          <select
            name="status"
            defaultValue={status}
            className="select select-bordered bg-gray-50 border-gray-200 focus:border-indigo-400"
          >
            <option value="all">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
          <button
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
            type="submit"
          >
            Filtrar
          </button>
        </form>

        {/* Tabla desktop */}
        <div className="hidden md:block rounded-2xl shadow bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            {/* ... (thead no cambia) ... */}
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-5 font-semibold">Nombre</th>
                <th className="text-left p-5 font-semibold">Fecha</th>
                <th className="text-left p-5 font-semibold">Ubicación</th>
                <th className="text-left p-5 font-semibold">Estado</th>
                <th className="text-left p-5 font-semibold">Entradas</th>
                <th className="text-right p-5 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* --- CAMBIO: Eliminado el tipo '(ev: Row)' --- */}
              {data.map((ev) => (
                <tr
                  key={ev.id}
                  className="border-b last:border-b-0 hover:bg-indigo-50/30 transition"
                >
                  <td className="p-5 font-medium">{ev.nombre}</td>
                  <td className="p-5">
                    {new Date(ev.fecha).toLocaleString("es-CL", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="p-5 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-indigo-400" />
                    {/* --- CAMBIO: Leer desde 'venue' y 'comuna' --- */}
                    {[
                      ev.venue?.name,
                      ev.venue?.address?.comuna?.name,
                    ]
                      .filter(Boolean)
                      .join(" — ") || "Sin ubicación"}
                  </td>
                  <td className="p-5">
                    {/* ... (Lógica de isPublished no cambia) ... */}
                    {ev.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        <CheckCircleIcon className="w-4 h-4" /> Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                        <XCircleIcon className="w-4 h-4" /> Borrador
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    {/* ... (Lógica de isTicketed no cambia) ... */}
                    {ev.isTicketed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        <TicketIcon className="w-4 h-4" /> Sí
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                        No
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    {/* ... (Link de Editar no cambia) ... */}
                    <Link
                      href={`/admin/eventos/${ev.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {!data.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-gray-500"
                  >
                    No hay eventos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Lista mobile */}
        <div className="md:hidden space-y-4">
          {/* --- CAMBIO: Eliminado el tipo '(ev: Row)' --- */}
          {data.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl shadow bg-white border border-gray-200 p-4 flex flex-col gap-2"
            >
              <div className="font-semibold text-lg">{ev.nombre}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDaysIcon className="w-4 h-4" />
                {new Date(ev.fecha).toLocaleString("es-CL", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4" />
                {/* --- CAMBIO: Leer desde 'venue' y 'comuna' --- */}
                {[
                  ev.venue?.name,
                  ev.venue?.address?.comuna?.name,
                ]
                  .filter(Boolean)
                  .join(" — ") || "Sin ubicación"}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {/* ... (Lógica de isPublished/isTicketed no cambia) ... */}
                {ev.isPublished ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                    <CheckCircleIcon className="w-4 h-4" /> Publicado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                    <XCircleIcon className="w-4 h-4" /> Borrador
                  </span>
                )}
                <span className="text-gray-400">|</span>
                {ev.isTicketed ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    <TicketIcon className="w-4 h-4" /> Sí
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">
                    No
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {/* ... (Link de Editar no cambia) ... */}
                <Link
                  href={`/admin/eventos/${ev.id}`}
                  className="flex justify-center items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition flex-1"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Editar
                </Link>
              </div>
            </div>
          ))}
          {!data.length && (
            <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow border border-gray-200">
              No hay eventos
            </div>
          )}
        </div>

        {/* ... (Paginación no cambia) ... */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <span>
            Mostrando página {pagination.page} de {pagination.totalPages} —
            Total: {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={buildPageUrl(Math.max(1, page - 1))}
              className={`btn btn-sm ${
                page === 1 ? "btn-disabled" : "btn-outline"
              }`}
            >
              Anterior
            </Link>
            <Link
              href={buildPageUrl(
                Math.min(pagination.totalPages || 1, page + 1)
              )}
              className={`btn btn-sm ${
                page >= pagination.totalPages ? "btn-disabled" : "btn-outline"
              }`}
            >
              Siguiente
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}