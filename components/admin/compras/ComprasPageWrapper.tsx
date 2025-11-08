"use client";

import { useState } from "react";
import ComprasFilters from "@/components/admin/compras/ComprasFilters";
import ComprasTable from "@/components/admin/compras/ComprasTable";
import PopupModal from "@/components/ui/PopupModal";
import { getCompraById } from "@/app/admin/compras/actions";

const allowedSorts = ["fecha_desc", "fecha_asc", "total_desc", "total_asc"] as const;
type SortType = typeof allowedSorts[number];

function getValidSort(sort: string | undefined): SortType {
  return allowedSorts.includes(sort as SortType) ? (sort as SortType) : "fecha_desc";
}

type CompraDetail = Awaited<ReturnType<typeof getCompraById>>;

function CompraDetailPopup({ compra }: { compra: CompraDetail }) {
  if (!compra) return <div className="text-center py-8">No encontrada</div>;

  const nombreCompleto = compra.user?.profile
    ? [
        compra.user.profile.nombres,
        compra.user.profile.apellidoPaterno,
        compra.user.profile.apellidoMaterno,
      ].filter(Boolean).join(" ")
    : "";

  return (
    <div className="text-blue-100">
      <h2 className="text-lg font-bold mb-4 text-white">Detalle de compra</h2>
      <div className="mb-2 text-sm">
        <b className="text-blue-300">ID:</b> <span className="text-blue-100">{compra.id}</span>
      </div>
      <div className="mb-2 text-sm">
        <b className="text-blue-300">Fecha compra:</b> <span className="text-blue-100">{new Date(compra.createdAt).toLocaleString("es-CL")}</span>
      </div>
      <div className="mb-2 text-sm">
        <b className="text-blue-300">Evento:</b> <span className="text-blue-100">{compra.evento?.nombre ?? "—"}{" "}
        {compra.evento?.fecha && (
          <>({new Date(compra.evento.fecha).toLocaleString("es-CL")})</>
        )}</span>
      </div>
      <div className="mb-2 text-sm">
        <b className="text-blue-300">Comprador:</b> <span className="text-blue-100">{nombreCompleto || "—"} — {compra.user?.email}</span>
      </div>
      <div className="mb-2 text-sm">
        <b className="text-blue-300">Comuna:</b> <span className="text-blue-100">{compra.user?.profile?.comuna?.name ?? "—"}{" "}
        <b className="text-blue-300">Región:</b> {compra.user?.profile?.comuna?.region?.name ?? "—"}</span>
      </div>
      <div className="mb-2 text-sm">
        <b className="text-blue-300">Estado:</b> <span className="text-blue-100">{compra.status}</span>
      </div>
      <div className="mb-2 text-sm">
        <b className="text-blue-300">Entradas:</b>
        <ul className="mt-2 space-y-2">
          {compra.items.map((item) => (
            <li key={item.id} className="border-b border-blue-700/30 pb-2">
              <div>
                <b className="text-blue-300">Tipo:</b> <span className="text-blue-100">{item.ticketType.name}</span>
              </div>
              <div>
                <b className="text-blue-300">Cantidad:</b> <span className="text-blue-100">{item.quantity}</span>
              </div>
              <div>
                <b className="text-blue-300">Precio unitario:</b> <span className="text-blue-100">${item.unitPrice.toLocaleString("es-CL")}</span>
              </div>
              <div>
                <b className="text-blue-300">Total:</b> <span className="text-blue-100">${item.subtotal.toLocaleString("es-CL")}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-2 text-sm">
        <b className="text-blue-300">Total compra:</b> <span className="text-blue-100 font-bold">${compra.total.toLocaleString("es-CL")}</span>
      </div>
    </div>
  );
}

export default function ComprasPageWrapper({
  searchParams,
  comprasData,
  events,
  stats,
  pagination,
  filterDefaults,
}: {
  searchParams: Record<string, string | undefined>;
  comprasData: any[];
  events: any[];
  stats: any;
  pagination: any;
  filterDefaults: any;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<CompraDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerClick = async (compraId: string) => {
    setLoading(true);
    setModalOpen(true);
    const compra = await getCompraById(compraId);
    setSelectedCompra(compra);
    setLoading(false);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedCompra(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Compras</h1>

      <ComprasFilters
        events={events}
        defaults={filterDefaults}
        sort={getValidSort(filterDefaults.sort)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 rounded-xl shadow-lg">
          <h3 className="font-semibold text-blue-100">Ingresos brutos</h3>
          <p className="text-2xl font-bold text-white">
            ${stats?.ingresosBrutos?.toLocaleString("es-CL") ?? "0"}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 rounded-xl shadow-lg">
          <h3 className="font-semibold text-blue-100">Entradas vendidas</h3>
          <p className="text-2xl font-bold text-white">{stats?.entradasVendidas ?? "0"}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 rounded-xl shadow-lg">
          <h3 className="font-semibold text-blue-100">Por tipo</h3>
          {stats &&
            Object.entries(stats.porTipo).map(([tipo, data]) => {
              const tipoData = data as { cantidad: number; total: number };
              return (
                <div key={tipo} className="flex justify-between text-white">
                  <span>
                    {tipo}: {tipoData.cantidad}
                  </span>
                  <span>${tipoData.total.toLocaleString("es-CL")}</span>
                </div>
              );
            })}
        </div>
      </div>

      <ComprasTable
        rows={comprasData}
        pagination={pagination}
        onVerClick={handleVerClick}
      />

      <PopupModal open={modalOpen} onClose={handleClose}>
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : selectedCompra ? (
          <CompraDetailPopup compra={selectedCompra} />
        ) : null}
      </PopupModal>
    </div>
  );
}