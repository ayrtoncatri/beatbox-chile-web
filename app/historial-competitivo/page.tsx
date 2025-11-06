import EventosList from "@/components/historial-competitivo/EventosList";
import CompetidoresList from "@/components/historial-competitivo/CompetidoresList";

// --- (1) Importamos las Server Actions de la Fase 5 ---
import { getPublicEventsList, getPublicCompetitorsList } from "@/app/actions/public-data";
import { Suspense } from "react";

// --- (2) Convertimos la página en 'async' ---
export default async function HistorialCompetitivoPage() {
  
  // --- (3) Obtenemos los datos en el servidor ---
  // (Usamos Promise.all para cargar ambos listados en paralelo)
  const [eventsData, competitorsData] = await Promise.all([
    getPublicEventsList(),
    getPublicCompetitorsList()
  ]);

  return (
    // (Tu 'main' y sus estilos se mantienen igual)
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
      
      {/* --- (4) Pasamos los datos como 'props' a los componentes --- */}
      {/* (Envolvemos en Suspense por si acaso, aunque Promise.all ya espera) */}
      <Suspense fallback={<div className="text-white">Cargando eventos...</div>}>
        <EventosList events={eventsData} />
      </Suspense>

      <Suspense fallback={<div className="text-white">Cargando competidores...</div>}>
        <CompetidoresList competitors={competitorsData} />
      </Suspense>
      
    </main>
  );
}