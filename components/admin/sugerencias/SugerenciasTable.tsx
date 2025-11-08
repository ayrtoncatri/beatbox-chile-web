"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { SuggestionStatus } from "@prisma/client";
import { deleteSugerencia } from "@/app/admin/sugerencias/actions";

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
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (sugerenciaId: string) => {
    if (!confirm("¿Eliminar esta sugerencia?")) return;

    // 2. Usa 'sugerenciaId' aquí
    setLoadingId(sugerenciaId); 
    startTransition(async () => {
      try {
        // 3. Usa 'sugerenciaId' aquí también.
        //    Esto resuelve el error de scope de TypeScript.
        const result = await deleteSugerencia(sugerenciaId); 
        if (!result.success) {
          throw new Error(result.message || "Error al eliminar");
        }
      } catch (error: any) {
        alert(error.message || "No se pudo eliminar");
      } finally {
        setLoadingId(null);
      }
    });
  };

  const openDetail = (id: string) => {
    const ev = new CustomEvent("sugerencia:open", { detail: { id } });
    window.dispatchEvent(ev);
  };

  // --- DESKTOP TABLE ---
  return (
    <>
      <div className="hidden md:block overflow-auto rounded-2xl shadow-lg bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-900/50 text-blue-200 text-sm border-b border-blue-700/30">
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
              <tr key={r.id} className="hover:bg-blue-800/30 transition border-b border-blue-700/20">
                <td className="px-4 py-3 text-white">{new Date(r.createdAt).toLocaleString("es-CL")}</td>
                <td className="px-4 py-3 text-white">{r.user?.nombres ?? "(Sin nombre)"}</td>
                <td className="px-4 py-3 text-white">{r.user?.email ?? "(Sin email)"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                    statusConfig[r.estado]?.color?.includes('green') 
                      ? "bg-green-900/50 text-green-300 border-green-700/30"
                      : statusConfig[r.estado]?.color?.includes('red')
                      ? "bg-red-900/50 text-red-300 border-red-700/30"
                      : statusConfig[r.estado]?.color?.includes('yellow')
                      ? "bg-yellow-900/50 text-yellow-300 border-yellow-700/30"
                      : "bg-blue-900/50 text-blue-300 border-blue-700/30"
                  }`}>
                    {statusConfig[r.estado]?.label ?? r.estado}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-white">{r.mensaje}</td>
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/50 text-blue-200 hover:bg-blue-600/70 border border-blue-500/30 font-semibold transition"
                    onClick={() => openDetail(r.id)}
                    title="Ver detalle"
                  >
                    <EyeIcon className="w-4 h-4" /> Ver
                  </button>
                  <button
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/50 text-red-200 hover:bg-red-600/70 border border-red-500/30 font-semibold transition ${loadingId === r.id ? "opacity-60" : ""}`}
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
                <td colSpan={6} className="text-center text-sm text-blue-300/70 py-6">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE CARDS --- */}
      <div className="md:hidden space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white">{r.user?.nombres ?? "(Sin nombre)"}</div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                statusConfig[r.estado]?.color?.includes('green') 
                  ? "bg-green-900/50 text-green-300 border-green-700/30"
                  : statusConfig[r.estado]?.color?.includes('red')
                  ? "bg-red-900/50 text-red-300 border-red-700/30"
                  : statusConfig[r.estado]?.color?.includes('yellow')
                  ? "bg-yellow-900/50 text-yellow-300 border-yellow-700/30"
                  : "bg-blue-900/50 text-blue-300 border-blue-700/30"
              }`}>
                {statusConfig[r.estado]?.label ?? r.estado}
              </span>
            </div>
            <div className="text-xs text-blue-300/70">{r.user?.email ?? "(Sin email)"}</div>
            <div className="text-xs text-blue-300/70">Fecha: {new Date(r.createdAt).toLocaleString("es-CL")}</div>
            <div className="text-sm text-white whitespace-pre-line">{r.mensaje}</div>
            <div className="flex gap-2 mt-2">
              <button
                className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-blue-600/50 text-blue-200 hover:bg-blue-600/70 border border-blue-500/30 font-semibold transition flex-1"
                onClick={() => openDetail(r.id)}
                title="Ver detalle"
              >
                <EyeIcon className="w-4 h-4" /> Ver
              </button>
              <button
                className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-red-600/50 text-red-200 hover:bg-red-600/70 border border-red-500/30 font-semibold transition flex-1 ${loadingId === r.id ? "opacity-60" : ""}`}
                onClick={() => handleDelete(r.id)}
                title="Eliminar"
              >
                <TrashIcon className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-6 text-center text-blue-300/70 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 rounded-xl shadow-lg">
            Sin resultados
          </div>
        )}
      </div>
    </>
  );
}