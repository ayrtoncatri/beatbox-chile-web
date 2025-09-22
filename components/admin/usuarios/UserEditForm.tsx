"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSquareIcon, UserIcon } from "@heroicons/react/24/solid";

type User = {
  id: string;
  email: string | null;
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  role: string;
  image: string | null;
};

export default function UserEditForm({ user }: { user: User }) {
  const [nombres, setNombres] = useState(user.nombres ?? "");
  const [apellidoPaterno, setApellidoPaterno] = useState(user.apellidoPaterno ?? "");
  const [apellidoMaterno, setApellidoMaterno] = useState(user.apellidoMaterno ?? "");
  const [role, setRole] = useState(user.role);
  const [image, setImage] = useState(user.image ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: nombres || null,
          apellidoPaterno: apellidoPaterno || null,
          apellidoMaterno: apellidoMaterno || null,
          role,
          image: image || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Error al actualizar");
      }
      setOk(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Email</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100" value={user.email || ""} disabled />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Rol</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
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
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            placeholder="Nombres"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Apellido paterno</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            value={apellidoPaterno}
            onChange={(e) => setApellidoPaterno(e.target.value)}
            placeholder="Apellido paterno"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Apellido materno</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            value={apellidoMaterno}
            onChange={(e) => setApellidoMaterno(e.target.value)}
            placeholder="Apellido materno"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Imagen (URL)</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {ok && <div className="text-green-600 text-sm">Guardado</div>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          disabled={loading}
        >
          <PencilSquareIcon className="w-5 h-5" />
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}