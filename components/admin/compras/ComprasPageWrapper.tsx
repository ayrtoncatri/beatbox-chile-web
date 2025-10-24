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
    <div>
      <h2 className="text-lg font-bold mb-4">Detalle de compra</h2>
      <div className="mb-2 text-sm">
        <b>ID:</b> {compra.id}
      </div>
      <div className="mb-2 text-sm">
        <b>Fecha compra:</b> {new Date(compra.createdAt).toLocaleString("es-CL")}
      </div>
      <div className="mb-2 text-sm">
        <b>Evento:</b> {compra.evento?.nombre ?? "—"}{" "}
        {compra.evento?.fecha && (
          <>({new Date(compra.evento.fecha).toLocaleString("es-CL")})</>
        )}
      </div>
      <div className="mb-2 text-sm">
        <b>Comprador:</b> {nombreCompleto || "—"} — {compra.user?.email}
      </div>
      <div className="mb-2 text-sm">
        <b>Comuna:</b> {compra.user?.profile?.comuna?.name ?? "—"}{" "}
        <b>Región:</b> {compra.user?.profile?.comuna?.region?.name ?? "—"}
      </div>
      <div className="mb-2 text-sm">
        <b>Estado:</b> {compra.status}
      </div>
      <div className="mb-2 text-sm">
        <b>Entradas:</b>
        <ul className="mt-2 space-y-2">
          {compra.items.map((item) => (
            <li key={item.id} className="border-b pb-2">
              <div>
                <b>Tipo:</b> {item.ticketType.name}
              </div>
              <div>
                <b>Cantidad:</b> {item.quantity}
              </div>
              <div>
                <b>Precio unitario:</b> ${item.unitPrice.toLocaleString("es-CL")}
              </div>
              <div>
                <b>Total:</b> ${item.subtotal.toLocaleString("es-CL")}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-2 text-sm">
        <b>Total compra:</b> ${compra.total.toLocaleString("es-CL")}
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
      <h1 className="text-3xl font-bold mb-8">Compras</h1>

      <ComprasFilters
        events={events}
        defaults={filterDefaults}
        sort={getValidSort(filterDefaults.sort)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-700">Ingresos brutos</h3>
          <p className="text-2xl font-bold">
            ${stats?.ingresosBrutos?.toLocaleString("es-CL") ?? "0"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-700">Entradas vendidas</h3>
          <p className="text-2xl font-bold">{stats?.entradasVendidas ?? "0"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-700">Por tipo</h3>
          {stats &&
            Object.entries(stats.porTipo).map(([tipo, data]) => {
              const tipoData = data as { cantidad: number; total: number };
              return (
                <div key={tipo} className="flex justify-between">
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