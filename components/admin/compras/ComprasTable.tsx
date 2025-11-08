"use client";

import { EyeIcon, TrashIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PaymentStatus } from "@prisma/client";

type CompraItemRow = {
  tipoEntrada: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
};

type Row = {
  id: string;
  createdAt: string | Date;
  status: PaymentStatus;
  userNombre: string;
  userEmail: string;
  comuna: string;
  region: string;
  eventoId: string;
  eventoNombre: string;
  eventoFecha: string | Date;
  eventoTipo: string;
  eventoVenue: string;
  items: CompraItemRow[];
  total: number;
};


function StatusBadge({ status }: { status: PaymentStatus }) {
  let bgColor = "bg-blue-900/50";
  let textColor = "text-blue-200";

  switch (status) {
    case "pagada":
      bgColor = "bg-green-900/50";
      textColor = "text-green-300";
      break;
    case "pendiente":
      bgColor = "bg-yellow-900/50";
      textColor = "text-yellow-300";
      break;
    case "fallida":
      bgColor = "bg-red-900/50";
      textColor = "text-red-300";
      break;
    case "reembolsada": // Añadir si lo usas
      bgColor = "bg-blue-900/50";
      textColor = "text-blue-300";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${bgColor} ${textColor} border border-blue-700/30`}
    >
      {status}
    </span>
  );
}


export default function ComprasTable(props: {
  rows: Row[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number; sort: string };
  onVerClick?: (compraId: string) => void;
}) {
  const { rows, onVerClick } = props;
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

  // --- DESKTOP TABLE ---
  return (
    <>
      <div className="hidden md:block overflow-auto rounded-2xl shadow-lg bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-900/50 text-blue-200 text-sm border-b border-blue-700/30">
              <th className="px-4 py-3 font-semibold">Fecha compra</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
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
              <tr key={r.id} className="hover:bg-blue-800/30 transition border-b border-blue-700/20">
                <td className="px-4 py-3 text-white">
                  {new Date(r.createdAt).toLocaleString("es-CL")}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-white">{r.eventoNombre}</td>
                <td className="px-4 py-3 text-white">{new Date(r.eventoFecha).toLocaleString("es-CL")}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{r.userNombre}</span>
                    <span className="text-xs text-blue-200">{r.comuna}, {r.region}</span>
                    <button className="link text-xs text-blue-300 hover:text-blue-200" onClick={() => copyEmail(r.userEmail)} title="Copiar email">
                      {r.userEmail}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {r.items.map((item, idx) => (
                    <div key={idx} className="mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                        item.tipoEntrada === "VIP" ? "bg-yellow-900/50 text-yellow-300 border-yellow-700/30" : "bg-blue-900/50 text-blue-300 border-blue-700/30"
                      }`}>
                        {item.tipoEntrada}
                      </span>
                      <span className="ml-2 text-white">x{item.cantidad}</span>
                      <span className="ml-2 text-white">${item.precioUnitario.toLocaleString("es-CL")}</span>
                      <span className="ml-2 font-semibold text-white">${item.total.toLocaleString("es-CL")}</span>
                    </div>
                  ))}
                </td>
                {/* Cantidad: suma de todas las cantidades de los items */}
                <td className="px-4 py-3 text-center text-white">
                  {r.items.reduce((sum, item) => sum + item.cantidad, 0)}
                </td>
                {/* Precio unitario: muestra todos los precios unitarios separados por coma */}
                <td className="px-4 py-3 text-white">
                  {r.items.map((item, idx) => (
                    <span key={idx}>
                      {idx > 0 && ", "}
                      ${item.precioUnitario.toLocaleString("es-CL")}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3 font-semibold text-white">${r.total.toLocaleString("es-CL")}</td>
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/50 text-blue-200 hover:bg-blue-600/70 border border-blue-500/30 font-semibold transition"
                    onClick={() => onVerClick?.(r.id)}
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
                  <a
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-800/50 text-blue-200 hover:bg-blue-800/70 border border-blue-700/30 font-semibold transition"
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
                <td colSpan={9} className="text-center text-sm text-blue-300/70 py-6">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE CARDS --- */}
      <div className="md:hidden space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 flex flex-col gap-2">
            <div className="font-semibold text-base text-white">{r.eventoNombre}</div>
            <div className="text-xs text-blue-300/70">Fecha compra: {new Date(r.createdAt).toLocaleString("es-CL")}</div>
            <div><StatusBadge status={r.status} /></div>
            <div className="text-xs text-blue-300/70">Fecha evento: {new Date(r.eventoFecha).toLocaleString("es-CL")}</div>
            <div className="text-xs text-blue-300/70">
              Comprador: <span className="font-medium text-white">{r.userNombre}</span>
              <button className="ml-2 link text-xs text-blue-300 hover:text-blue-200" onClick={() => copyEmail(r.userEmail)} title="Copiar email">
                {r.userEmail}
              </button>
              <span className="ml-2 text-white">{r.comuna}, {r.region}</span>
            </div>
            <div>
              {r.items.map((item, idx) => (
                <div key={idx} className="mb-1 flex gap-2 items-center text-xs">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                    item.tipoEntrada === "VIP" ? "bg-yellow-900/50 text-yellow-300 border-yellow-700/30" : "bg-blue-900/50 text-blue-300 border-blue-700/30"
                  }`}>
                    {item.tipoEntrada}
                  </span>
                  <span className="text-white">Cant: <b className="text-white">{item.cantidad}</b></span>
                  <span className="text-white">Unit: <b className="text-white">${item.precioUnitario.toLocaleString("es-CL")}</b></span>
                  <span className="text-white">Total: <b className="text-white">${item.total.toLocaleString("es-CL")}</b></span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/50 text-blue-200 hover:bg-blue-600/70 border border-blue-500/30 font-semibold transition flex-1"
                onClick={() => onVerClick?.(r.id)}
                title="Ver detalle"
              >
                <EyeIcon className="w-4 h-4" /> Ver
              </button>
              <button
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/50 text-red-200 hover:bg-red-600/70 border border-red-500/30 font-semibold transition flex-1 ${loadingId === r.id ? "opacity-60" : ""}`}
                onClick={() => handleDelete(r.id)}
                title="Eliminar"
              >
                <TrashIcon className="w-4 h-4" /> Eliminar
              </button>
              <a
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-800/50 text-blue-200 hover:bg-blue-800/70 border border-blue-700/30 font-semibold transition flex-1"
                href={`/admin/compras?eventId=${r.eventoId}`}
                title="Ver evento"
              >
                <CalendarDaysIcon className="w-4 h-4" /> Ver evento
              </a>
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