"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  createdAt: string | Date;
  userNombre: string;
  userEmail: string;
  eventoId: string;
  eventoNombre: string;
  eventoFecha: string | Date;
  tipoEntrada: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
};

export default function ComprasTable(props: {
  rows: Row[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number; sort: string };
}) {
  const { rows } = props;
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta compra?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/compras/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error");
      router.refresh();
    } catch {
      alert("No se pudo eliminar");
    } finally {
      setLoadingId(null);
    }
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {}
  };

  const openDetail = (id: string) => {
    const ev = new CustomEvent("compra:open", { detail: { id } });
    window.dispatchEvent(ev);
  };

  return (
    <div className="overflow-auto rounded-lg shadow bg-white">
      <table className="table w-full">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm">
            <th className="px-3 py-2">Fecha compra</th>
            <th className="px-3 py-2">Evento</th>
            <th className="px-3 py-2">Fecha evento</th>
            <th className="px-3 py-2">Comprador</th>
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Cant.</th>
            <th className="px-3 py-2">Precio unit.</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 transition">
              <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString("es-CL")}</td>
              <td className="px-3 py-2">{r.eventoNombre}</td>
              <td className="px-3 py-2">{new Date(r.eventoFecha).toLocaleString("es-CL")}</td>
              <td className="px-3 py-2">
                <div className="flex flex-col">
                  <span className="font-medium">{r.userNombre}</span>
                  <button className="link text-xs text-blue-600" onClick={() => copyEmail(r.userEmail)} title="Copiar email">
                    {r.userEmail}
                  </button>
                </div>
              </td>
              <td className="px-3 py-2">
                <span className={`badge ${r.tipoEntrada === "VIP" ? "badge-warning" : "badge-info"}`}>
                  {r.tipoEntrada}
                </span>
              </td>
              <td className="px-3 py-2 text-center">{r.cantidad}</td>
              <td className="px-3 py-2">${r.precioUnitario.toLocaleString("es-CL")}</td>
              <td className="px-3 py-2 font-semibold">${r.total.toLocaleString("es-CL")}</td>
              <td className="px-3 py-2 flex flex-wrap gap-2">
                <button className="btn btn-xs btn-outline" onClick={() => openDetail(r.id)}>Ver</button>
                <button
                  className={`btn btn-xs btn-error ${loadingId === r.id ? "loading" : ""}`}
                  onClick={() => handleDelete(r.id)}
                >
                  Eliminar
                </button>
                <a className="btn btn-xs btn-secondary" href={`/admin/compras?eventId=${r.eventoId}`}>Ver evento</a>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center text-sm text-gray-500 py-6">Sin resultados</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}