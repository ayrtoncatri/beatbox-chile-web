import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UserEditForm from "@/components/admin/usuarios/UserEditForm";
import ToggleUserActiveButton from "@/components/admin/usuarios/ToggleUserActiveButton";

export default async function UsuarioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
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
  });

  if (!user) notFound();

  const nombreCompleto =
    [user.nombres, user.apellidoPaterno, user.apellidoMaterno].filter(Boolean).join(" ") || "Sin nombre";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{nombreCompleto}</h2>
          <div className="text-sm text-gray-600">ID: {user.id}</div>
        </div>
        <Link href="/admin/usuarios" className="text-sm text-blue-600 hover:underline">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded border bg-white p-4">
          <h3 className="font-medium mb-4">Editar usuario</h3>
          <UserEditForm user={user} />
        </div>

        <div className="rounded border bg-white p-4">
          <h3 className="font-medium mb-4">Resumen</h3>
          <div className="text-sm space-y-2">
            <div><span className="text-gray-500">Email:</span> {user.email}</div>
            <div><span className="text-gray-500">Rol:</span> {user.role}</div>
            <div>
              <span className="text-gray-500">Estado:</span>{" "}
              <span className={user.isActive ? "text-green-700" : "text-red-700"}>
                {user.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <ToggleUserActiveButton id={user.id} isActive={user.isActive} />
          </div>
        </div>
      </div>
    </div>
  );
}