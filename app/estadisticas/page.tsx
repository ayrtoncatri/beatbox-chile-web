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
  const [eventStats, competitorStats, judgeStats] = await Promise.all([
    getEventStats(),
    getCompetitorStats(),
    getJudgeStats()
  ]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03060b] text-white selection:bg-fuchsia-400/30 selection:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.065)_1px,transparent_1px),linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px)] bg-size-[44px_44px]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_12%_18%,rgba(244,63,94,0.38),transparent_27%),radial-gradient(circle_at_88%_14%,rgba(6,182,212,0.3),transparent_30%),linear-gradient(180deg,transparent_60%,rgba(244,63,94,0.13))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.1)_0,rgba(255,255,255,0.1)_1px,transparent_1px,transparent_7px)]" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-3 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="relative overflow-hidden border border-white/15 bg-[#050810]/90 shadow-[0_0_60px_rgba(8,145,178,0.12)] [clip-path:polygon(0_18px,18px_0,calc(100%_-_18px)_0,100%_18px,100%_calc(100%_-_18px),calc(100%_-_18px)_100%,18px_100%,0_calc(100%_-_18px))]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-rose-500 via-white/20 to-cyan-300" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 border-b border-r border-cyan-300/60" />
          <div className="pointer-events-none absolute left-0 top-0 h-24 w-24 border-l border-t border-rose-500/60" />

          <header className="relative px-5 pb-7 pt-9 sm:px-8 lg:px-10 lg:pb-9">
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300 sm:text-xs">
              <ChartBarSquareIcon className="h-4 w-4" aria-hidden="true" />
              Datos oficiales del circuito
            </div>
            <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-[2.125rem] font-bold uppercase italic leading-[0.82] tracking-[-0.045em] text-white sm:text-7xl lg:text-[6.5rem]">
              Centro de
              <span className="block">
                estadísticas
                <span className="ml-2 text-transparent [-webkit-text-stroke:1px_rgba(34,211,238,0.75)] sm:ml-3">V2</span>
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-medium text-white/60 sm:text-base">
              Rendimiento, participación y métricas del beatbox competitivo nacional.
            </p>
          </header>

          <div className="relative space-y-12 px-4 pb-8 sm:px-7 sm:pb-10 lg:px-9">
            <Suspense fallback={<LoadingSpinner label="Cargando métricas de eventos..." />}>
              <EstadisticasEventos stats={eventStats} />
            </Suspense>

            <Suspense fallback={<LoadingSpinner label="Analizando competidores..." />}>
              <EstadisticasCompetidor stats={competitorStats} />
            </Suspense>

            <Suspense fallback={<LoadingSpinner label="Procesando datos de jueces..." />}>
              <EstadisticasJueces stats={judgeStats} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoadingSpinner({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center space-y-4 border border-cyan-300/20 bg-cyan-300/5">
      <div className="relative">
        <div className="h-14 w-14 rounded-full border-2 border-cyan-300/20" />
        <div className="absolute inset-0 h-14 w-14 animate-spin rounded-full border-2 border-transparent border-t-cyan-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <ArrowPathIcon className="h-5 w-5 animate-pulse text-cyan-300" />
        </div>
      </div>
      <span className="animate-pulse font-mono text-xs uppercase tracking-widest text-cyan-100/70">
        {label}
      </span>
    </div>
  );
}