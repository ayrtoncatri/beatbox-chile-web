"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { editUser } from "@/app/admin/usuarios/actions";
import { Prisma } from "@prisma/client";
import toast from "react-hot-toast";

const userWithProfileAndRoles = Prisma.validator<Prisma.UserDefaultArgs>()({
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

type UserFormProps = Prisma.UserGetPayload<typeof userWithProfileAndRoles>;


function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
      disabled={pending}
    >
      <PencilSquareIcon className="w-5 h-5" />
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

export default function UserEditForm({ 
    user, 
    isSelf,
    isTargetAdmin, 
  }: { 
    user: UserFormProps 
    isSelf: boolean;
    isTargetAdmin: boolean; 
  }) {
  const [nombres, setNombres] = useState(user.profile?.nombres ?? "");
  const [apellidoPaterno, setApellidoPaterno] = useState(user.profile?.apellidoPaterno ?? "");
  const [apellidoMaterno, setApellidoMaterno] = useState(user.profile?.apellidoMaterno ?? "");
  
  const [role, setRole] = useState(user.roles[0]?.role.name ?? "user");
  
  const [image, setImage] = useState(user.image ?? "");

  const initialState = { ok: false, error: null };
  const [state, formAction] = useActionState(editUser, initialState);

  useEffect(() => {
    setNombres(user.profile?.nombres ?? "");
    setApellidoPaterno(user.profile?.apellidoPaterno ?? "");
    setApellidoMaterno(user.profile?.apellidoMaterno ?? "");
    setRole(user.roles[0]?.role.name ?? "user");
    setImage(user.image ?? "");
  }, [user]);

  useEffect(() => {
    if (state.ok) {
      toast.success("Usuario actualizado correctamente");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.ok, state.error]);

  const isRoleChangeDisabled = isSelf || isTargetAdmin;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={user.id} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Email</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-800"
            value={user.email || ""} // 'email' sigue estando en 'user'
            disabled
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Rol</label>
          <select
            className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 ${
              isRoleChangeDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            // 3. Aplicamos la restricción al <select>
            disabled={isRoleChangeDisabled}
            title={isRoleChangeDisabled ? "No puedes cambiar el rol de un administrador." : ""}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="judge">judge</option> {/* Añadí 'judge' como ejemplo */}
          </select>
          {isRoleChangeDisabled && (
            <p className="text-xs text-gray-500 mt-1">
              No puedes cambiar el rol de un administrador.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Nombres</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-800"
            name="nombres"
            value={nombres} // El 'value' viene del estado local
            onChange={(e) => setNombres(e.target.value)}
            placeholder="Nombres"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Apellido paterno</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-800"
            name="apellidoPaterno"
            value={apellidoPaterno} // El 'value' viene del estado local
            onChange={(e) => setApellidoPaterno(e.target.value)}
            placeholder="Apellido paterno"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Apellido materno</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-800"
            name="apellidoMaterno"
            value={apellidoMaterno} // El 'value' viene del estado local
            onChange={(e) => setApellidoMaterno(e.target.value)}
            placeholder="Apellido materno"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Imagen (URL)</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-800"
            name="image"
            value={image} // El 'value' viene del estado local
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton />
      </div>
    </form>
  );
}