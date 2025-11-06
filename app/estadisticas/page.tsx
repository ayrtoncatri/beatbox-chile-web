import EstadisticasEventos from "@/components/estadisticas/EstadisticasEventos";
import EstadisticasCompetidor from "@/components/estadisticas/EstadisticasCompetidor";
// --- (1) Importamos el nuevo componente de Jueces ---
import EstadisticasJueces from "@/components/estadisticas/EstadisticasJueces"; 
import type { Metadata } from "next";
// --- (2) Importamos las Server Actions de la Fase 5 ---
import { getEventStats, getCompetitorStats, getJudgeStats } from "@/app/actions/public-data";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Estadísticas | Beatbox Chile",
  description: "Consulta las estadísticas de competencias, ligas y eventos de Beatbox Chile. Analiza los puntajes y rankings de los competidores.",
  keywords: ["Beatbox Chile", "estadísticas", "competencias", "ligas", "ranking", "puntajes", "eventos beatbox"],
};

// --- (3) Convertimos la página en 'async' ---
export default async function EstadisticasPage() {

  // --- (4) Obtenemos los datos en el servidor ---
  const [eventStats, competitorStats, judgeStats] = await Promise.all([
    getEventStats(),
    getCompetitorStats(),
    getJudgeStats()
  ]);

  return (
    // (Tu 'main' y sus estilos se mantienen igual)
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
      
      {/* --- (5) Pasamos los datos como 'props' a los componentes --- */}
      <Suspense fallback={<LoadingSpinner />}>
        <EstadisticasEventos stats={eventStats} />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <EstadisticasCompetidor stats={competitorStats} />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <EstadisticasJueces stats={judgeStats} />
      </Suspense>
      
    </main>
  );
}

// Un componente de carga simple y estilizado
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-48">
      <div className="w-12 h-12 border-4 border-t-transparent border-fuchsia-500 rounded-full animate-spin"></div>
    </div>
  );
}