"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { SuggestionStatus } from "@prisma/client";

type Row = {
  id: string;
  mensaje: string;
  estado: SuggestionStatus;
  createdAt: string | Date;
  user: { id: string; nombres: string | null; email: string | null } | null;
};

const statusConfig: Record<SuggestionStatus, { label: string; color: string }> = {
  [SuggestionStatus.nuevo]: { label: "Nuevo", color: "bg-yellow-100 text-yellow-700" },
  [SuggestionStatus.en_progreso]: { label: "En Progreso", color: "bg-blue-100 text-blue-700" },
  [SuggestionStatus.resuelta]: { label: "Resuelta", color: "bg-green-100 text-green-700" },
  [SuggestionStatus.descartada]: { label: "Descartada", color: "bg-red-100 text-red-700" },
};

export default function SugerenciasTable(props: {
  rows: Row[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}) {
  const { rows } = props;
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta sugerencia?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/sugerencias/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error");
      router.refresh();
    } catch {
      alert("No se pudo eliminar");
    } finally {
      setLoadingId(null);
    }
  };

  const openDetail = (id: string) => {
    const ev = new CustomEvent("sugerencia:open", { detail: { id } });
    window.dispatchEvent(ev);
  };

  // --- DESKTOP TABLE ---
  return (
    <>
      <div className="hidden md:block overflow-auto rounded-2xl shadow bg-white border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Contenido</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-indigo-50/30 transition">
                <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString("es-CL")}</td>
                <td className="px-4 py-3">{r.user?.nombres ?? "(Sin nombre)"}</td>
                <td className="px-4 py-3">{r.user?.email ?? "(Sin email)"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    statusConfig[r.estado]?.color ?? "bg-gray-100 text-gray-700"
                  }`}>
                    {statusConfig[r.estado]?.label ?? r.estado}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-xs truncate">{r.mensaje}</td>
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition"
                    onClick={() => openDetail(r.id)}
                    title="Ver detalle"
                  >
                    <EyeIcon className="w-4 h-4" /> Ver
                  </button>
                  <button
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition ${loadingId === r.id ? "opacity-60" : ""}`}
                    onClick={() => handleDelete(r.id)}
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-sm text-gray-500 py-6">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE CARDS --- */}
      <div className="md:hidden space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl shadow bg-white border border-gray-200 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{r.user?.nombres ?? "(Sin nombre)"}</div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                statusConfig[r.estado]?.color ?? "bg-gray-100 text-gray-700"
              }`}>
                {statusConfig[r.estado]?.label ?? r.estado}
              </span>
            </div>
            <div className="text-xs text-gray-500">{r.user?.email ?? "(Sin email)"}</div>
            <div className="text-xs text-gray-500">Fecha: {new Date(r.createdAt).toLocaleString("es-CL")}</div>
            <div className="text-sm text-gray-700 whitespace-pre-line">{r.mensaje}</div>
            <div className="flex gap-2 mt-2">
              <button
                className="btn btn-xs btn-info flex-1 flex items-center gap-1"
                onClick={() => openDetail(r.id)}
                title="Ver detalle"
              >
                <EyeIcon className="w-4 h-4" /> Ver
              </button>
              <button
                className={`btn btn-xs btn-error flex-1 flex items-center gap-1 ${loadingId === r.id ? "loading" : ""}`}
                onClick={() => handleDelete(r.id)}
                title="Eliminar"
              >
                <TrashIcon className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow border border-gray-200">
            Sin resultados
          </div>
        )}
      </div>
    </>
  );
}