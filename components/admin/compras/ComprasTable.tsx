"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { EyeIcon, TrashIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

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

  // --- DESKTOP TABLE ---
  return (
    <>
      <div className="hidden md:block overflow-auto rounded-2xl shadow bg-white border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="px-4 py-3 font-semibold">Fecha compra</th>
              <th className="px-4 py-3 font-semibold">Evento</th>
              <th className="px-4 py-3 font-semibold">Fecha evento</th>
              <th className="px-4 py-3 font-semibold">Comprador</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Cant.</th>
              <th className="px-4 py-3 font-semibold">Precio unit.</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-indigo-50/30 transition">
                <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString("es-CL")}</td>
                <td className="px-4 py-3">{r.eventoNombre}</td>
                <td className="px-4 py-3">{new Date(r.eventoFecha).toLocaleString("es-CL")}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{r.userNombre}</span>
                    <button className="link text-xs text-blue-600" onClick={() => copyEmail(r.userEmail)} title="Copiar email">
                      {r.userEmail}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    r.tipoEntrada === "VIP" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {r.tipoEntrada}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{r.cantidad}</td>
                <td className="px-4 py-3">${r.precioUnitario.toLocaleString("es-CL")}</td>
                <td className="px-4 py-3 font-semibold">${r.total.toLocaleString("es-CL")}</td>
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
                  <a
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition"
                    href={`/admin/compras?eventId=${r.eventoId}`}
                    title="Ver evento"
                  >
                    <CalendarDaysIcon className="w-4 h-4" /> Ver evento
                  </a>
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

      {/* --- MOBILE CARDS --- */}
      <div className="md:hidden space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl shadow bg-white border border-gray-200 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-base">{r.eventoNombre}</div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                r.tipoEntrada === "VIP" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
              }`}>
                {r.tipoEntrada}
              </span>
            </div>
            <div className="text-xs text-gray-500">Fecha compra: {new Date(r.createdAt).toLocaleString("es-CL")}</div>
            <div className="text-xs text-gray-500">Fecha evento: {new Date(r.eventoFecha).toLocaleString("es-CL")}</div>
            <div className="text-xs text-gray-500">
              Comprador: <span className="font-medium">{r.userNombre}</span>
              <button className="ml-2 link text-xs text-blue-600" onClick={() => copyEmail(r.userEmail)} title="Copiar email">
                {r.userEmail}
              </button>
            </div>
            <div className="flex gap-2 text-xs">
              <span>Cant: <b>{r.cantidad}</b></span>
              <span>Unit: <b>${r.precioUnitario.toLocaleString("es-CL")}</b></span>
              <span>Total: <b>${r.total.toLocaleString("es-CL")}</b></span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition flex-1"
                onClick={() => openDetail(r.id)}
                title="Ver detalle"
              >
                <EyeIcon className="w-4 h-4" /> Ver
              </button>
              <button
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition flex-1 ${loadingId === r.id ? "opacity-60" : ""}`}
                onClick={() => handleDelete(r.id)}
                title="Eliminar"
              >
                <TrashIcon className="w-4 h-4" /> Eliminar
              </button>
              <a
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition flex-1"
                href={`/admin/compras?eventId=${r.eventoId}`}
                title="Ver evento"
              >
                <CalendarDaysIcon className="w-4 h-4" /> Ver evento
              </a>
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