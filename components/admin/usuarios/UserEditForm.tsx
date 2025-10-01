"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { editUser } from "@/app/admin/usuarios/actions";

type User = {
  id: string;
  email: string | null;
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  role: string;
  image: string | null;
};

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

export default function UserEditForm({ user }: { user: User }) {
  const [nombres, setNombres] = useState(user.nombres ?? "");
  const [apellidoPaterno, setApellidoPaterno] = useState(user.apellidoPaterno ?? "");
  const [apellidoMaterno, setApellidoMaterno] = useState(user.apellidoMaterno ?? "");
  const [role, setRole] = useState(user.role);
  const [image, setImage] = useState(user.image ?? "");

  const initialState = { ok: false, error: null };
  const [state, formAction] = useActionState(editUser, initialState);

  // Sincronizar los estados locales cuando el prop user cambie
  useEffect(() => {
    setNombres(user.nombres ?? "");
    setApellidoPaterno(user.apellidoPaterno ?? "");
    setApellidoMaterno(user.apellidoMaterno ?? "");
    setRole(user.role);
    setImage(user.image ?? "");
  }, [user]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={user.id} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Email</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100" value={user.email || ""} disabled />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Rol</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Nombres</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="nombres"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            placeholder="Nombres"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Apellido paterno</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="apellidoPaterno"
            value={apellidoPaterno}
            onChange={(e) => setApellidoPaterno(e.target.value)}
            placeholder="Apellido paterno"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Apellido materno</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="apellidoMaterno"
            value={apellidoMaterno}
            onChange={(e) => setApellidoMaterno(e.target.value)}
            placeholder="Apellido materno"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Imagen (URL)</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="image"
            value={image}
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