"use client";

import { useEffect, useState } from "react";

type Compra = {
  id: string;
  createdAt: string;
  userNombre: string;
  userEmail: string;
  eventoId: string;
  eventoNombre: string;
  eventoFecha: string;
  tipoEntrada: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
};

export default function CompraDetailDrawer() {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [data, setData] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onOpen = (e: any) => {
      setId(e.detail.id);
      setOpen(true);
    };
    window.addEventListener("compra:open", onOpen as any);
    return () => window.removeEventListener("compra:open", onOpen as any);
  }, []);

  useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    fetch(`/api/admin/compras/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setData(j))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [open, id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-8 shadow-2xl overflow-auto rounded-l-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Detalle de compra</h2>
          <button className="btn btn-sm btn-outline" onClick={() => setOpen(false)}>Cerrar</button>
        </div>
        {loading && <div className="text-center text-gray-500">Cargando...</div>}
        {!loading && data && (
          <div className="space-y-3">
            <div><b>ID:</b> <span className="text-gray-600">{data.id}</span></div>
            <div><b>Fecha compra:</b> <span className="text-gray-600">{new Date(data.createdAt).toLocaleString("es-CL")}</span></div>
            <div><b>Evento:</b> <span className="text-gray-600">{data.eventoNombre} ({new Date(data.eventoFecha).toLocaleString("es-CL")})</span></div>
            <div><b>Comprador:</b> <span className="text-gray-600">{data.userNombre} — {data.userEmail}</span></div>
            <div><b>Tipo:</b> <span className="text-gray-600">{data.tipoEntrada}</span></div>
            <div><b>Cantidad:</b> <span className="text-gray-600">{data.cantidad}</span></div>
            <div><b>Precio unitario:</b> <span className="text-gray-600">${data.precioUnitario.toLocaleString("es-CL")}</span></div>
            <div><b>Total:</b> <span className="text-gray-600 font-bold">${data.total.toLocaleString("es-CL")}</span></div>
          </div>
        )}
        {!loading && !data && <div className="text-sm text-gray-500">No se encontró la compra.</div>}
      </div>
    </div>
  );
}