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
    <div className="min-h-screen py-8 px-2 sm:px-6">
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
              <h2 className="text-2xl font-bold text-white">{nombreCompleto}</h2>
              <div className="text-xs text-blue-300/70">ID: {user.id}</div>
            </div>
          </div>
          <Link href="/admin/usuarios" className="btn btn-outline btn-sm text-blue-200 border-blue-700/50 hover:bg-blue-800/50">
            ← Volver
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg p-8 shadow-lg space-y-6">
            <h3 className="font-semibold mb-2 text-lg text-white">Editar usuario</h3>
            <UserEditForm 
              user={user} 
              isSelf={isSelf} 
              isTargetAdmin={isTargetAdmin}
            />
          </div>

          <div className="rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg p-8 shadow-lg flex flex-col gap-4">
            <h3 className="font-semibold mb-2 text-lg text-white">Resumen</h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-blue-300/70 ">Email:</span> 
                <span className="capitalize text-blue-100">{user.email}</span>
              </div>
              <div>
                <span className="text-blue-300/70">Rol:</span>{" "}
                <span className="capitalize text-blue-100">{roles}</span>
              </div>
              <div>
                <span className="text-blue-300/70">Estado:</span>{" "}
                <span
                  className={
                    user.isActive
                      ? "bg-green-900/50 text-green-300 border border-green-700/30 px-2 py-0.5 rounded-full text-xs font-semibold"
                      : "bg-red-900/50 text-red-300 border border-red-700/30 px-2 py-0.5 rounded-full text-xs font-semibold"
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