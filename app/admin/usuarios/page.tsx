import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import ToggleUserActiveButton from "@/components/admin/usuarios/ToggleUserActiveButton";

type Props = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
    status?: "all" | "active" | "inactive";
  }>;
};

export default async function UsuariosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp?.q?.trim() || "";
  const status = (sp?.status as any) || "all";
  const page = Math.max(1, parseInt(sp?.page || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(sp?.pageSize || "20", 10)));
  const skip = (page - 1) * pageSize;

  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { nombres: { contains: q, mode: "insensitive" } },
            { apellidoPaterno: { contains: q, mode: "insensitive" } },
            { apellidoMaterno: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        role: true,
        image: true,
        isActive: true,
      },
      orderBy: { id: "asc" },
      skip,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (pageSize !== 20) params.set("pageSize", String(pageSize));
    if (status && status !== "all") params.set("status", status);
    params.set("page", String(p));
    return `/admin/usuarios?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Usuarios</h2>
        <form method="GET" action="/admin/usuarios" className="flex items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o email"
            className="border rounded px-3 py-2 text-sm w-64"
          />
          <select name="status" defaultValue={status} className="border rounded px-2 py-2 text-sm">
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <select name="pageSize" defaultValue={String(pageSize)} className="border rounded px-2 py-2 text-sm">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <button className="border rounded px-3 py-2 text-sm bg-white hover:bg-gray-50" type="submit">
            Buscar
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Usuario</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {u.image ? (
                      <img src={u.image} alt={u.email ?? "avatar"} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-200" />
                    )}
                    <div>
                      <div className="font-medium">
                        {[u.nombres, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(" ") || "—"}
                      </div>
                      <div className="text-xs text-gray-500">ID: {u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                      u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {u.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/usuarios/${u.id}`} className="text-blue-600 hover:underline">
                      Ver
                    </Link>
                    <ToggleUserActiveButton
                      id={u.id}
                      isActive={u.isActive}
                      disabledReason={undefined}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Mostrando {users.length} de {total} usuarios</div>
        <div className="flex items-center gap-2">
          <Link
            href={buildPageUrl(Math.max(1, page - 1))}
            className={`px-3 py-1.5 border rounded text-sm ${
              page === 1 ? "pointer-events-none opacity-50" : "bg-white hover:bg-gray-50"
            }`}
          >
            Anterior
          </Link>
          <span className="text-sm">Página {page} de {totalPages}</span>
          <Link
            href={buildPageUrl(Math.min(totalPages, page + 1))}
            className={`px-3 py-1.5 border rounded text-sm ${
              page >= totalPages ? "pointer-events-none opacity-50" : "bg-white hover:bg-gray-50"
            }`}
          >
            Siguiente
          </Link>
        </div>
      </div>
    </div>
  );
}