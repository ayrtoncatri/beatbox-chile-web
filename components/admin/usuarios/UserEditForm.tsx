"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { editUser } from "@/app/admin/usuarios/actions";
import { Prisma, Role } from "@prisma/client";
import toast from "react-hot-toast";


const userWithProfileAndRoles = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    profile: true,
    roles: {
      include: {
        role: {
          select: { id: true, name: true },
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
      className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition"
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
    allRoles, 
  }: { 
    user: UserFormProps 
    isSelf: boolean;
    isTargetAdmin: boolean; 
    allRoles: Role[];
  }) {
  const [nombres, setNombres] = useState(user.profile?.nombres ?? "");
  const [apellidoPaterno, setApellidoPaterno] = useState(user.profile?.apellidoPaterno ?? "");
  const [apellidoMaterno, setApellidoMaterno] = useState(user.profile?.apellidoMaterno ?? "");
  
  const [role, setRole] = useState(user.roles[0]?.role.name ?? "user");
  
  const [image, setImage] = useState(user.image ?? "");

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    user.roles.map(r => r.role.id)
  );

  const initialState = { ok: false, error: null };
  const [state, formAction] = useActionState(editUser, initialState);

  useEffect(() => {
    setNombres(user.profile?.nombres ?? "");
    setApellidoPaterno(user.profile?.apellidoPaterno ?? "");
    setApellidoMaterno(user.profile?.apellidoMaterno ?? "");
    setSelectedRoleIds(user.roles.map(r => r.role.id));
    setImage(user.image ?? "");
  }, [user]);

  useEffect(() => {
    if (state.ok) {
      toast.success("Usuario actualizado correctamente");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.ok, state.error]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleIds(prevIds => 
      prevIds.includes(roleId) 
        ? prevIds.filter(id => id !== roleId) // Quitar rol
        : [...prevIds, roleId] // Añadir rol
    );
  };

  // No se puede modificar el rol 'admin' de un admin (incluido uno mismo)
  const isRoleChangeDisabled = isTargetAdmin;

  // Obtener el ID del rol admin para asegurarnos de que siempre se envíe si el usuario es admin
  const adminRoleId = allRoles.find(r => r.name === 'admin')?.id;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={user.id} />
      {/* Asegurar que el rol admin siempre se envíe si el usuario objetivo es admin */}
      {isTargetAdmin && adminRoleId && (
        <input type="hidden" name="roles" value={adminRoleId} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-blue-200 mb-1 font-medium">Email</label>
          <input
            className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-blue-100 placeholder:text-blue-300/70 opacity-70"
            value={user.email || ""} // 'email' sigue estando en 'user'
            disabled
          />
        </div>

        <div>
          <label className="block text-sm text-blue-200 mb-1 font-medium">Rol</label>
          <div className="space-y-2 mt-2">
            {allRoles.map(role => {
              // No se puede desmarcar el rol 'admin' de un admin
              // (ni de uno mismo si es admin)
              const isDisabled = isRoleChangeDisabled && role.name === 'admin';
              
              return (
                <label key={role.id} className={`flex items-center gap-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    // El 'name' es crucial para 'formData.getAll'
                    name="roles" 
                    value={role.id}
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={() => !isDisabled && handleRoleChange(role.id)}
                    disabled={isDisabled}
                    className="rounded border-blue-700/50 bg-blue-950/50 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-blue-100 capitalize">{role.name}</span>
                </label>
              );
            })}
          </div>
          {isRoleChangeDisabled && (
            <p className="text-xs text-blue-300/70 mt-1">
              No puedes quitar el rol de 'admin' a un administrador, pero puedes agregar otros roles.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-blue-200 mb-1 font-medium">Nombres</label>
          <input
            className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
            name="nombres"
            value={nombres} // El 'value' viene del estado local
            onChange={(e) => setNombres(e.target.value)}
            placeholder="Nombres"
          />
        </div>

        <div>
          <label className="block text-sm text-blue-200 mb-1 font-medium">Apellido paterno</label>
          <input
            className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
            name="apellidoPaterno"
            value={apellidoPaterno} // El 'value' viene del estado local
            onChange={(e) => setApellidoPaterno(e.target.value)}
            placeholder="Apellido paterno"
          />
        </div>

        <div>
          <label className="block text-sm text-blue-200 mb-1 font-medium">Apellido materno</label>
          <input
            className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
            name="apellidoMaterno"
            value={apellidoMaterno} // El 'value' viene del estado local
            onChange={(e) => setApellidoMaterno(e.target.value)}
            placeholder="Apellido materno"
          />
        </div>

        <div>
          <label className="block text-sm text-blue-200 mb-1 font-medium">Imagen (URL)</label>
          <input
            className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
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