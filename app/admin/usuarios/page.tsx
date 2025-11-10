import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import ToggleUserActiveButton from "@/components/admin/usuarios/ToggleUserActiveButton";
import { EyeIcon, UserIcon } from "@heroicons/react/24/solid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";


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
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-white">Usuarios</h2>
          <form
            method="GET"
            action="/admin/usuarios"
            className="flex flex-wrap items-center gap-2 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 rounded-xl shadow-lg px-4 py-2 text-blue-100 placeholder:text-blue-400/50"
          >
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre o email"
              className="input input-bordered w-40 sm:w-64 bg-blue-950/50 border-blue-700/50 text-white placeholder:text-blue-300/70 focus:border-blue-500"
            />
            <select
              name="status"
              defaultValue={status}
              className="select select-bordered bg-blue-950/50 border-blue-700/50 text-white focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            <select
              name="pageSize"
              defaultValue={String(pageSize)}
              className="select select-bordered bg-blue-950/50 border-blue-700/50 text-white focus:border-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <button
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition"
              type="submit"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Tabla desktop */}
        <div className="hidden md:block rounded-2xl shadow-lg bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-900/50 text-blue-200 border-b border-blue-700/30">
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
                  <tr key={u.id} className="border-b border-blue-700/20 last:border-b-0 hover:bg-blue-800/30 transition">
                    <td className="p-5">
                      {/* ... (código de perfil de usuario) ... */}
                       <div className="flex items-center gap-3">
                         {u.image ? (
                           <Image
                            src={u.image}
                            alt={u.email ?? "avatar"}
                            width={44}                      // w-11 = 44px
                            height={44}                     // h-11 = 44px
                            sizes="44px"                    // evita cargar imágenes más grandes
                            className="rounded-full object-cover border-2 border-blue-500/50 shadow"
                          />
                         ) : (
                           <div className="w-11 h-11 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 font-bold text-xl border-2 border-blue-500/50 shadow">
                             <UserIcon className="w-6 h-6" />
                           </div>
                         )}
                         <div>
                           <div className="font-semibold text-white text-base">
                             {[u.profile?.nombres, u.profile?.apellidoPaterno, u.profile?.apellidoMaterno]
                               .filter(Boolean)
                               .join(" ") || "—"}
                           </div>
                           <div className="text-xs text-blue-300/70">ID: {u.id}</div>
                         </div>
                       </div>
                    </td>
                    <td className="p-5 text-white">{u.email}</td>
                    <td className="p-5 capitalize text-white">
                      {u.roles.length > 0
                        ? u.roles.map((userRole) => userRole.role.name).join(", ")
                        : "Sin rol"}
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                          u.isActive
                            ? "bg-green-900/50 text-green-300 border-green-700/30"
                            : "bg-red-900/50 text-red-300 border-red-700/30"
                        }`}
                      >
                        {u.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/usuarios/${u.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/50 text-blue-200 hover:bg-blue-600/70 border border-blue-500/30 font-semibold transition"
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
                  <td className="p-6 text-center text-blue-300/70" colSpan={5}>
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
                className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 flex flex-col gap-2"
              >
                {/* ... (código de perfil móvil) ... */}
                <div className="flex items-center gap-3">
                   {u.image ? (
                     <Image
                      src={u.image}
                      alt={u.email ?? "avatar"}
                      width={40}                      // w-10 = 40px
                      height={40}                     // h-10 = 40px
                      sizes="40px"
                      className="rounded-full object-cover border-2 border-blue-500/50 shadow"
                    />
                   ) : (
                     <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 font-bold text-lg border-2 border-blue-500/50 shadow">
                       <UserIcon className="w-5 h-5" />
                     </div>
                   )}
                   <div>
                     <div className="font-semibold text-white">
                       {[u.profile?.nombres, u.profile?.apellidoPaterno, u.profile?.apellidoMaterno]
                         .filter(Boolean)
                         .join(" ") || "—"}
                     </div>
                     <div className="text-xs text-blue-300/70">ID: {u.id}</div>
                   </div>
                 </div>
                 <div className="text-xs text-white">{u.email}</div>
                 <div className="flex items-center gap-2 text-xs">
                   <span className="capitalize text-white">
                     {u.roles.length > 0
                       ? u.roles.map((userRole) => userRole.role.name).join(", ")
                       : "Sin rol"}
                   </span>
                   <span
                     className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                       u.isActive
                         ? "bg-green-900/50 text-green-300 border-green-700/30"
                         : "bg-red-900/50 text-red-300 border-red-700/30"
                     }`}
                   >
                     {u.isActive ? "Activo" : "Inactivo"}
                   </span>
                 </div>
                <div className="flex gap-2 mt-2">
                  <Link
                    href={`/admin/usuarios/${u.id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-blue-600/50 text-blue-200 hover:bg-blue-600/70 border border-blue-500/30 font-semibold transition flex-1"
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
            <div className="p-6 text-center text-blue-300/70 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 rounded-xl shadow-lg">
              No se encontraron usuarios.
            </div>
          )}
        </div>

        {/* ... (Paginación no necesita cambios) ... */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-blue-200">
            Mostrando {users.length} de {total} usuarios
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={buildPageUrl(Math.max(1, page - 1))}
              className={`btn btn-sm ${page === 1 ? "btn-disabled opacity-50" : "bg-blue-600/50 text-blue-200 border-blue-500/30 hover:bg-blue-600/70"}`}
            >
              Anterior
            </Link>
            <span className="text-sm text-blue-200">
              Página {page} de {totalPages}
            </span>
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