"use client";
import { useState, useEffect } from "react";
import SugerenciasTable from "./SugerenciasTable";
import SugerenciaDetailPopup from "./SugerenciaDetailPopup";
import SugerenciasFilters from "./SugerenciasFilters";

export default function SugerenciasPageWrapper({
  rows,
  pagination,
  filterDefaults,
  stats,
  searchParams,
  users,
}: {
  rows: any[];
  pagination: any;
  filterDefaults: any;
  stats: any;
  searchParams: any;
  users: { id: string; nombres: string | null }[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      setSelectedId(e.detail.id);
      setPopupOpen(true);
    };
    window.addEventListener("sugerencia:open", handler);
    return () => window.removeEventListener("sugerencia:open", handler);
  }, []);

  return (
    <>
      {/* Filtros arriba de la tabla */}
      <SugerenciasFilters users={users} defaults={filterDefaults} />
      <SugerenciasTable rows={rows} pagination={pagination} />
      <SugerenciaDetailPopup
        id={selectedId}
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
}