"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { editUser } from "@/app/admin/usuarios/actions";
import { Prisma } from "@prisma/client";

// --- CAMBIO: Importamos tipos de Prisma para el prop 'user' ---
// Esto nos da autocompletado y seguridad de tipos basado en la consulta
// que hicimos en el archivo page.tsx

// 1. Creamos un validador con la misma consulta de la página anterior
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

// 2. Extraemos el tipo de dato (Payload) de ese validador
type UserFormProps = Prisma.UserGetPayload<typeof userWithProfileAndRoles>;
// --- Fin del cambio de tipos ---

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

// --- CAMBIO: Usamos el nuevo tipo 'UserFormProps' ---
export default function UserEditForm({ user }: { user: UserFormProps }) {
  // --- CAMBIO: Leemos los datos desde 'user.profile' y 'user.roles' ---
  const [nombres, setNombres] = useState(user.profile?.nombres ?? "");
  const [apellidoPaterno, setApellidoPaterno] = useState(user.profile?.apellidoPaterno ?? "");
  const [apellidoMaterno, setApellidoMaterno] = useState(user.profile?.apellidoMaterno ?? "");
  
  // Asumimos un solo rol para este formulario.
  // Si el usuario tiene roles, usa el nombre del primero. Si no, 'user' por defecto.
  const [role, setRole] = useState(user.roles[0]?.role.name ?? "user");
  
  const [image, setImage] = useState(user.image ?? "");

  const initialState = { ok: false, error: null };
  const [state, formAction] = useActionState(editUser, initialState);

  // --- CAMBIO: Sincronizamos los estados locales leyendo del prop anidado ---
  useEffect(() => {
    setNombres(user.profile?.nombres ?? "");
    setApellidoPaterno(user.profile?.apellidoPaterno ?? "");
    setApellidoMaterno(user.profile?.apellidoMaterno ?? "");
    setRole(user.roles[0]?.role.name ?? "user");
    setImage(user.image ?? "");
  }, [user]); // El 'user' prop es la única dependencia

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={user.id} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Email</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100"
            value={user.email || ""} // 'email' sigue estando en 'user'
            disabled
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Rol</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="role"
            value={role} // El 'value' viene del estado local
            onChange={(e) => setRole(e.target.value)}
          >
            {/* NOTA: Esto sigue hardcodeado. 
              En el futuro, podrías hacer un fetch a la tabla 'Role'
              para mostrar todos los roles disponibles.
            */}
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="judge">judge</option> {/* Añadí 'judge' como ejemplo */}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Nombres</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="nombres"
            value={nombres} // El 'value' viene del estado local
            onChange={(e) => setNombres(e.target.value)}
            placeholder="Nombres"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Apellido paterno</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="apellidoPaterno"
            value={apellidoPaterno} // El 'value' viene del estado local
            onChange={(e) => setApellidoPaterno(e.target.value)}
            placeholder="Apellido paterno"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Apellido materno</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="apellidoMaterno"
            value={apellidoMaterno} // El 'value' viene del estado local
            onChange={(e) => setApellidoMaterno(e.target.value)}
            placeholder="Apellido materno"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Imagen (URL)</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="image"
            value={image} // El 'value' viene del estado local
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      {state.error && <div className="text-red-600 text-sm">{state.error}</div>}
      {state.ok && <div className="text-green-600 text-sm">Guardado</div>}

      <div className="flex items-center gap-2">
        <SubmitButton />
      </div>
    </form>
  );
}