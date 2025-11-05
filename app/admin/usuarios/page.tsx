import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import ToggleUserActiveButton from "@/components/admin/usuarios/ToggleUserActiveButton";
import { EyeIcon, UserIcon } from "@heroicons/react/24/solid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
    status?: "all" | "active" | "inactive";
  }>;
};

export default async function UsuariosPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;
  
  const sp = await searchParams;
  const q = sp?.q?.trim() || "";
  const status = sp?.status || "all";
  const page = Math.max(1, parseInt(sp?.page || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(sp?.pageSize || "20", 10)));
  const skip = (page - 1) * pageSize;

  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { profile: { nombres: { contains: q, mode: "insensitive" } } },
            { profile: { apellidoPaterno: { contains: q, mode: "insensitive" } } },
            { profile: { apellidoMaterno: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  if (status === "active") {
    where.isActive = true;
  } else if (status === "inactive") {
    where.isActive = false;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        profile: true, 
        roles: {
          include: {
            role: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Usuarios</h2>
          <form
            method="GET"
            action="/admin/usuarios"
            className="flex flex-wrap items-center gap-2 bg-white rounded-xl shadow px-4 py-2 border border-gray-200"
          >
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre o email"
              className="input input-bordered w-40 sm:w-64 bg-gray-50 border-gray-200 focus:border-indigo-400"
            />
            <select
              name="status"
              defaultValue={status}
              className="select select-bordered bg-gray-50 border-gray-200 focus:border-indigo-400"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            <select
              name="pageSize"
              defaultValue={String(pageSize)}
              className="select select-bordered bg-gray-50 border-gray-200 focus:border-indigo-400"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <button
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
              type="submit"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Tabla desktop */}
        <div className="hidden md:block rounded-2xl shadow bg-white border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-5 font-semibold">Usuario</th>
                <th className="text-left p-5 font-semibold">Email</th>
                <th className="text-left p-5 font-semibold">Rol</th>
                <th className="text-left p-5 font-semibold">Estado</th>
                <th className="text-right p-5 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                // 3. LÓGICA DE RESTRICCIÓN
                const isSelf = u.id === currentUserId;
                const isTargetAdmin = u.roles.some(r => r.role.name === 'admin');
                
                let disabledReason: string | undefined = undefined;
                if (isSelf) {
                  disabledReason = "No puedes desactivar tu propia cuenta.";
                } else if (isTargetAdmin) {
                  disabledReason = "No puedes desactivar a otro administrador.";
                }

                return (
                  <tr key={u.id} className="border-b last:border-b-0 hover:bg-indigo-50/30 transition">
                    <td className="p-5">
                      {/* ... (código de perfil de usuario) ... */}
                       <div className="flex items-center gap-3">
                         {u.image ? (
                           <img
                             src={u.image}
                             alt={u.email ?? "avatar"}
                             className="w-11 h-11 rounded-full object-cover border-2 border-indigo-200 shadow"
                           />
                         ) : (
                           <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-400 font-bold text-xl border-2 border-indigo-200 shadow">
                             <UserIcon className="w-6 h-6" />
                           </div>
                         )}
                         <div>
                           <div className="font-semibold text-gray-900 text-base">
                             {[u.profile?.nombres, u.profile?.apellidoPaterno, u.profile?.apellidoMaterno]
                               .filter(Boolean)
                               .join(" ") || "—"}
                           </div>
                           <div className="text-xs text-gray-400">ID: {u.id}</div>
                         </div>
                       </div>
                    </td>
                    <td className="p-5">{u.email}</td>
                    <td className="p-5 capitalize">
                      {u.roles.length > 0
                        ? u.roles.map((userRole) => userRole.role.name).join(", ")
                        : "Sin rol"}
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          u.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/usuarios/${u.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition"
                          title="Ver usuario"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Ver
                        </Link>
                        {/* 4. PASAR RESTRICCIÓN AL BOTÓN */}
                        <ToggleUserActiveButton
                          id={u.id}
                          isActive={u.isActive}
                          disabledReason={disabledReason}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
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

        {/* Lista mobile */}
        <div className="md:hidden space-y-4">
          {users.map((u) => {
            // 5. APLICAR LÓGICA DE RESTRICCIÓN (MÓVIL)
            const isSelf = u.id === currentUserId;
            const isTargetAdmin = u.roles.some(r => r.role.name === 'admin');
            
            let disabledReason: string | undefined = undefined;
            if (isSelf) {
              disabledReason = "No puedes desactivar tu propia cuenta.";
            } else if (isTargetAdmin) {
              disabledReason = "No puedes desactivar a otro administrador.";
            }
                
            return (
              <div
                key={u.id}
                className="rounded-2xl shadow bg-white border border-gray-200 p-4 flex flex-col gap-2"
              >
                {/* ... (código de perfil móvil) ... */}
                <div className="flex items-center gap-3">
                   {u.image ? (
                     <img
                       src={u.image}
                       alt={u.email ?? "avatar"}
                       className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 shadow"
                     />
                   ) : (
                     <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-400 font-bold text-lg border-2 border-indigo-200 shadow">
                       <UserIcon className="w-5 h-5" />
                     </div>
                   )}
                   <div>
                     <div className="font-semibold text-gray-900">
                       {[u.profile?.nombres, u.profile?.apellidoPaterno, u.profile?.apellidoMaterno]
                         .filter(Boolean)
                         .join(" ") || "—"}
                     </div>
                     <div className="text-xs text-gray-400">ID: {u.id}</div>
                   </div>
                 </div>
                 <div className="text-xs text-gray-500">{u.email}</div>
                 <div className="flex items-center gap-2 text-xs">
                   <span className="capitalize">
                     {u.roles.length > 0
                       ? u.roles.map((userRole) => userRole.role.name).join(", ")
                       : "Sin rol"}
                   </span>
                   <span
                     className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                       u.isActive
                         ? "bg-green-100 text-green-700"
                         : "bg-red-100 text-red-700"
                     }`}
                   >
                     {u.isActive ? "Activo" : "Inactivo"}
                   </span>
                 </div>
                <div className="flex gap-2 mt-2">
                  <Link
                    href={`/admin/usuarios/${u.id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition flex-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Ver
                  </Link>
                  {/* 6. PASAR RESTRICCIÓN AL BOTÓN (MÓVIL) */}
                  <ToggleUserActiveButton
                    id={u.id}
                    isActive={u.isActive}
                    disabledReason={disabledReason}
                  />
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow border border-gray-200">
              No se encontraron usuarios.
            </div>
          )}
        </div>

        {/* ... (Paginación no necesita cambios) ... */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-gray-600">
            Mostrando {users.length} de {total} usuarios
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={buildPageUrl(Math.max(1, page - 1))}
              className={`btn btn-sm ${page === 1 ? "btn-disabled" : "btn-outline"}`}
            >
              Anterior
            </Link>
            <span className="text-sm">
              Página {page} de {totalPages}
            </span>
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