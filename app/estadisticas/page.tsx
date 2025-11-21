import EstadisticasEventos from "@/components/estadisticas/EstadisticasEventos";
import EstadisticasCompetidor from "@/components/estadisticas/EstadisticasCompetidor";
import EstadisticasJueces from "@/components/estadisticas/EstadisticasJueces"; 
import type { Metadata } from "next";
import { getEventStats, getCompetitorStats, getJudgeStats } from "@/app/actions/public-data";
import { Suspense } from "react";
import { ChartBarSquareIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export const metadata: Metadata = {
  title: "Estadísticas | Beatbox Chile",
  description: "Centro de datos oficial. Analiza los puntajes, rankings y métricas de rendimiento de competencias, ligas y eventos de Beatbox Chile.",
  keywords: ["Beatbox Data", "Analytics", "Ranking Chile", "Puntajes Beatbox", "Métricas Competitivas"],
};

export default async function EstadisticasPage() {

  // Obtenemos los datos en el servidor
  const [eventStats, competitorStats, judgeStats] = await Promise.all([
    getEventStats(),
    getCompetitorStats(),
    getJudgeStats()
  ]);

  return (
    // CAMBIO 1: Fondo "Tech Data" (Grid sutil + Gradiente Oscuro)
    <main className="min-h-screen bg-[#020617] relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* FONDO: Malla Cuadriculada (Grid Pattern) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.1] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617] pointer-events-none" />

      {/* LUCES AMBIENTALES (Indigo/Cyan para sensación "Tech") */}
      <div className="fixed top-[-20%] left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-20%] right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HERO SECTION: Centro de Datos */}
      <section className="relative pt-36 pb-16 px-4 text-center max-w-6xl mx-auto z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-900/20 backdrop-blur-md mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <ChartBarSquareIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-black italic tracking-widest text-indigo-300 uppercase">
            System Analytics
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none drop-shadow-xl">
          Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Estadísticas</span>
        </h1>
        
        <p className="text-lg md:text-xl text-indigo-200/60 font-light max-w-2xl mx-auto font-mono">
          // Análisis de rendimiento y métricas del circuito nacional.
        </p>
      </section>

      {/* CONTENEDOR PRINCIPAL: Separación vertical amplia */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-24 space-y-24">
        
        <Suspense fallback={<LoadingSpinner label="Cargando Métricas de Eventos..." />}>
          <EstadisticasEventos stats={eventStats} />
        </Suspense>

        {/* Divisor Visual Tecnológico */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

        <Suspense fallback={<LoadingSpinner label="Analizando Competidores..." />}>
          <EstadisticasCompetidor stats={competitorStats} />
        </Suspense>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        <Suspense fallback={<LoadingSpinner label="Procesando Datos de Jueces..." />}>
          <EstadisticasJueces stats={judgeStats} />
        </Suspense>
        
      </div>
    </main>
  );
}

// Loading Spinner Mejorado (Estilo "Cargando Datos")
function LoadingSpinner({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <div className="relative">
        {/* Anillo Exterior */}
        <div className="w-16 h-16 border-4 border-indigo-500/30 rounded-full"></div>
        {/* Anillo Interior Giratorio */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        {/* Icono Central */}
        <div className="absolute inset-0 flex items-center justify-center">
            <ArrowPathIcon className="w-6 h-6 text-indigo-400 animate-pulse" />
        </div>
      </div>
      <span className="text-xs font-mono uppercase tracking-widest text-indigo-300 animate-pulse">
        {label}
      </span>
    </div>
  );
}