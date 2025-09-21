"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  mensaje: string;
  estado: string;
  createdAt: string | Date;
  user: { id: string; nombres: string | null; email: string | null } | null;
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

  return (
    <div className="overflow-auto rounded-lg shadow bg-white">
      <table className="table w-full">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm">
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Usuario</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Contenido</th>
            <th className="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 transition">
              <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString("es-CL")}</td>
              <td className="px-3 py-2">{r.user?.nombres ?? "(Sin nombre)"}</td>
              <td className="px-3 py-2">{r.user?.email ?? "(Sin email)"}</td>
              <td className="px-3 py-2">
                <span className={`badge ${r.estado === "PENDIENTE" ? "badge-warning" : r.estado === "REVISADA" ? "badge-success" : "badge-error"}`}>
                  {r.estado}
                </span>
              </td>
              <td className="px-3 py-2 max-w-xs truncate">{r.mensaje}</td>
              <td className="px-3 py-2 flex flex-wrap gap-2">
                <button className="btn btn-xs btn-outline" onClick={() => openDetail(r.id)}>Ver</button>
                <button
                  className={`btn btn-xs btn-error ${loadingId === r.id ? "loading" : ""}`}
                  onClick={() => handleDelete(r.id)}
                >
                  Eliminar
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
  );
}