import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Row = {
  id: string;
  nombre: string;
  fecha: Date;
  ciudad: string | null;
  lugar: string | null;
  isPublished: boolean;
  isTicketed: boolean;
};

function toInt(v: string | undefined, def: number) {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export default async function AdminEventosPage({
  searchParams,
}: {
  // En Next 15, es Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams; // <- importante
  const q = (sp.q as string) || "";
  const status = (sp.status as string) || "all";
  const page = toInt(sp.page as string, 1);
  const pageSize = Math.min(100, toInt(sp.pageSize as string, 20));
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: "insensitive" } },
      { ciudad: { contains: q, mode: "insensitive" } },
      { lugar: { contains: q, mode: "insensitive" } },
      { descripcion: { contains: q, mode: "insensitive" } },
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
      select: {
        id: true,
        nombre: true,
        fecha: true,
        lugar: true,
        ciudad: true,
        isPublished: true,
        isTicketed: true,
      },
    }),
  ]);

  const pagination = { total, page, pageSize, totalPages: Math.ceil(total / pageSize) };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Eventos</h1>
        <Link href="/admin/eventos/nuevo" className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-500">
          Nuevo evento
        </Link>
      </div>

      <form className="flex items-center gap-2 mb-4" action="/admin/eventos">
        <input name="q" placeholder="Buscar por nombre, ciudad o lugar" className="border rounded px-3 py-2 w-full max-w-md bg-white text-black" defaultValue={q} />
        <select name="status" defaultValue={status} className="border rounded px-2 py-2 bg-white text-black">
          <option value="all">Todos</option>
          <option value="published">Publicados</option>
          <option value="draft">Borradores</option>
        </select>
        <button className="px-3 py-2 rounded bg-gray-800 text-white">Aplicar</button>
      </form>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Ubicación</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Presencial</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((ev: Row) => (
              <tr key={ev.id} className="border-t">
                <td className="p-3">{ev.nombre}</td>
                <td className="p-3">{new Date(ev.fecha).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="p-3">{[ev.lugar, ev.ciudad].filter(Boolean).join(" — ")}</td>
                <td className="p-3">
                  {ev.isPublished ? <span className="px-2 py-1 rounded bg-green-100 text-green-700">Publicado</span> : <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">Borrador</span>}
                </td>
                <td className="p-3">
                  {ev.isTicketed ? <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">Sí</span> : <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">No</span>}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/eventos/${ev.id}`} className="text-blue-600 hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
            {!data.length && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No hay eventos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-sm">
        <span>Mostrando página {pagination.page} de {pagination.totalPages} — Total: {pagination.total}</span>
        <div className="flex items-center gap-2">
          <Link href={`/admin/eventos?${new URLSearchParams({ q, status, page: String(Math.max(1, page - 1)), pageSize: String(pageSize) }).toString()}`} className="px-2 py-1 border rounded text-gray-700 bg-white">Anterior</Link>
          <Link href={`/admin/eventos?${new URLSearchParams({ q, status, page: String(Math.min(pagination.totalPages || 1, page + 1)), pageSize: String(pageSize) }).toString()}`} className="px-2 py-1 border rounded text-gray-700 bg-white">Siguiente</Link>
        </div>
      </div>
    </main>
  );
}