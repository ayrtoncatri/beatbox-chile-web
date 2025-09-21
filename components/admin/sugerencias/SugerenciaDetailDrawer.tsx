"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  mensaje: string;
  estado: string;
  createdAt: string | Date;
  user: { id: string; nombres: string | null; email: string | null };
};

export default function SugerenciaDetailDrawer() {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [data, setData] = useState<Row | null>(null);
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState<string>("");

  useEffect(() => {
    const onOpen = (e: any) => {
      setId(e.detail.id);
      setOpen(true);
    };
    window.addEventListener("sugerencia:open", onOpen as any);
    return () => window.removeEventListener("sugerencia:open", onOpen as any);
  }, []);

  useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    fetch(`/api/admin/sugerencias/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        setData(j);
        setEstado(j.estado);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [open, id]);

  const handleEstado = async (nuevo: string) => {
    if (!id) return;
    setLoading(true);
    await fetch(`/api/admin/sugerencias/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevo }),
    });
    setEstado(nuevo);
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-8 shadow-2xl overflow-auto rounded-l-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Detalle de sugerencia</h2>
          <button className="btn btn-sm btn-outline" onClick={() => setOpen(false)}>Cerrar</button>
        </div>
        {loading && <div className="text-center text-gray-500">Cargando...</div>}
        {!loading && data && (
          <div className="space-y-3">
            <div><b>ID:</b> <span className="text-gray-600">{data.id}</span></div>
            <div><b>Fecha:</b> <span className="text-gray-600">{new Date(data.createdAt).toLocaleString("es-CL")}</span></div>
            <div><b>Usuario:</b> <span className="text-gray-600">{data.user.nombres ?? "(Sin nombre)"} — {data.user.email ?? "(Sin email)"}</span></div>
            <div><b>Estado:</b> <span className="text-gray-600">{estado}</span></div>
            <div><b>Mensaje:</b> <span className="text-gray-600 whitespace-pre-line">{data.mensaje}</span></div>
            <div className="flex gap-2 pt-2">
              <button className={`btn btn-xs ${estado === "PENDIENTE" ? "btn-warning" : "btn-outline"}`} onClick={() => handleEstado("PENDIENTE")}>Pendiente</button>
              <button className={`btn btn-xs ${estado === "REVISADA" ? "btn-success" : "btn-outline"}`} onClick={() => handleEstado("REVISADA")}>Revisada</button>
              <button className={`btn btn-xs ${estado === "DESCARTADA" ? "btn-error" : "btn-outline"}`} onClick={() => handleEstado("DESCARTADA")}>Descartada</button>
            </div>
          </div>
        )}
        {!loading && !data && <div className="text-sm text-gray-500">No se encontró la sugerencia.</div>}
      </div>
    </div>
  );
}