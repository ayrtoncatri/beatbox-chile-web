import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UserEditForm from "@/components/admin/usuarios/UserEditForm";
import ToggleUserActiveButton from "@/components/admin/usuarios/ToggleUserActiveButton";
import { UserIcon } from "@heroicons/react/24/solid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function UsuarioDetallePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;
  const { id } = params; 

  const user = await prisma.user.findUnique({
    where: { id },
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
  });

  if (!user) notFound();

  const nombreCompleto =
    [user.profile?.nombres, user.profile?.apellidoPaterno, user.profile?.apellidoMaterno]
      .filter(Boolean)
      .join(" ") || "Sin nombre";

  const roles =
    user.roles.length > 0
      ? user.roles.map((userRole) => userRole.role.name).join(", ")
      : "Sin rol";

  const isSelf = user.id === currentUserId;
  const isTargetAdmin = user.roles.some(r => r.role.name === 'admin');
  
  let disabledReason: string | undefined = undefined;
  if (isSelf) {
    disabledReason = "No puedes desactivar tu propia cuenta.";
  } else if (isTargetAdmin) {
    disabledReason = "No puedes desactivar a otro administrador.";
  }

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
              <h2 className="text-2xl font-bold text-gray-900 placeholder:text-gray-400">{nombreCompleto}</h2>
              <div className="text-xs text-gray-500">ID: {user.id}</div>
            </div>
          </div>
          <Link href="/admin/usuarios" className="btn btn-outline btn-sm text-gray-900 placeholder:text-gray-400">
            ← Volver
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-8 shadow space-y-6">
            <h3 className="font-semibold mb-2 text-lg text-gray-800">Editar usuario</h3>
            <UserEditForm 
              user={user} 
              isSelf={isSelf} 
              isTargetAdmin={isTargetAdmin}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow flex flex-col gap-4">
            <h3 className="font-semibold mb-2 text-lg text-gray-800">Resumen</h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-gray-500 ">Email:</span> 
                <span className="capitalize text-gray-900">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Rol:</span>{" "}
                <span className="capitalize text-gray-900">{roles}</span>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>{" "}
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
              <ToggleUserActiveButton 
                id={user.id} 
                isActive={user.isActive} 
                disabledReason={disabledReason}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}