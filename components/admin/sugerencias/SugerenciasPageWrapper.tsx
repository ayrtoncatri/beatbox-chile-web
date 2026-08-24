"use client";
import { useState, useEffect } from "react";
import SugerenciasTable, { type SugerenciaRow, type SugerenciaPagination } from "./SugerenciasTable";
import SugerenciaDetailPopup from "./SugerenciaDetailPopup";
import SugerenciasFilters, { type SugerenciaFilterDefaults } from "./SugerenciasFilters";

export default function SugerenciasPageWrapper({
  rows,
  pagination,
  filterDefaults,
  users,
}: {
  rows: SugerenciaRow[];
  pagination: SugerenciaPagination;
  filterDefaults: SugerenciaFilterDefaults;
  // Recibidos desde la página pero no usados por este wrapper todavía;
  // se dejan tipados como `unknown` en vez de quitarlos de la firma.
  stats?: unknown;
  searchParams?: unknown;
  users: { id: string; nombres: string | null }[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      if (e instanceof CustomEvent) {
        setSelectedId(e.detail.id);
        setPopupOpen(true);
      }
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