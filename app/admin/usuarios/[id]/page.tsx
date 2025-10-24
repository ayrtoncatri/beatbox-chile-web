import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UserEditForm from "@/components/admin/usuarios/UserEditForm";
import ToggleUserActiveButton from "@/components/admin/usuarios/ToggleUserActiveButton";
import { UserIcon } from "@heroicons/react/24/solid";

// <-- CAMBIO: Los params no son una promesa, se reciben directamente.
export default async function UsuarioDetallePage({ params }: { params: { id: string } }) {
  const { id } = params; // <-- CAMBIO: No se usa 'await'

  const user = await prisma.user.findUnique({
    where: { id },
    // <-- CAMBIO: Usamos 'include' en lugar de 'select' para traer las relaciones.
    include: {
      profile: true, // Traemos el perfil (nombres, apellidos)
      roles: {
        // Traemos los roles del usuario
        include: {
          role: {
            // Incluimos el modelo 'Role' para saber el nombre
            select: { name: true },
          },
        },
      },
    },
  });

  if (!user) notFound();

  // <-- CAMBIO: Leemos los datos desde 'user.profile'
  // Usamos optional chaining (?.) por si el perfil aún no ha sido creado.
  const nombreCompleto =
    [user.profile?.nombres, user.profile?.apellidoPaterno, user.profile?.apellidoMaterno]
      .filter(Boolean)
      .join(" ") || "Sin nombre";

  // <-- CAMBIO: Un usuario ahora puede tener múltiples roles.
  // Los unimos con comas para mostrarlos.
  const roles =
    user.roles.length > 0
      ? user.roles.map((userRole) => userRole.role.name).join(", ")
      : "Sin rol";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-2 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.email ?? "avatar"}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-400 font-bold text-3xl border-2 border-indigo-200 shadow">
                <UserIcon className="w-8 h-8" />
              </div>
            )}
            <div>
              {/* 'nombreCompleto' ya usa la nueva lógica */}
              <h2 className="text-2xl font-bold">{nombreCompleto}</h2>
              <div className="text-xs text-gray-400">ID: {user.id}</div>
            </div>
          </div>
          <Link href="/admin/usuarios" className="btn btn-outline btn-sm">
            ← Volver
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-8 shadow space-y-6">
            <h3 className="font-semibold mb-2 text-lg text-gray-800">Editar usuario</h3>
            {/* NOTA: 'UserEditForm' ahora recibe el objeto 'user' completo
              con 'profile' y 'roles' anidados.
              Este componente ES EL SIGUIENTE que debes enviarme,
              ya que necesitará una gran adaptación.
            */}
            <UserEditForm user={user} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow flex flex-col gap-4">
            <h3 className="font-semibold mb-2 text-lg text-gray-800">Resumen</h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-gray-500">Email:</span> {user.email}
              </div>
              <div>
                <span className="text-gray-500">Rol:</span>{" "}
                {/* <-- CAMBIO: Mostramos la nueva variable 'roles' */}
                <span className="capitalize">{roles}</span>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>{" "}
                {/* Esto sigue igual, 'isActive' sigue en 'User' */}
                <span
                  className={
                    user.isActive
                      ? "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"
                      : "bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold"
                  }
                >
                  {user.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            <div className="pt-2">
              {/* Esto sigue igual, 'id' e 'isActive' siguen en 'User' */}
              <ToggleUserActiveButton id={user.id} isActive={user.isActive} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}