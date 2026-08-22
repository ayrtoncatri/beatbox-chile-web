import EventosList from "@/components/historial-competitivo/EventosList";
import CompetidoresList from "@/components/historial-competitivo/CompetidoresList";
import { getPublicEventsList, getPublicCompetitorsList } from "@/app/actions/public-data";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ArchiveBoxIcon } from "@heroicons/react/24/solid";

export const metadata: Metadata = {
  title: "Historial Competitivo | Beatbox Chile",
  description: "Revisa el archivo de la Liga Competitiva. Explora eventos pasados, rankings históricos y la trayectoria de los competidores más legendarios.",
  keywords: ["Historial Beatbox", "Archivo Torneos", "Eventos Pasados", "Legends", "Ranking Histórico"],
};

function LoadingFallback({ text }: { text: string }) {
  return (
    <div className="flex h-48 w-full items-center justify-center border border-cyan-300/20 bg-cyan-300/5 p-4">
      <div className="mr-3 h-8 w-8 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">{text}</span>
    </div>
  );
}

export default async function HistorialCompetitivoPage() {
  const [eventsData, competitorsData] = await Promise.all([
    getPublicEventsList(),
    getPublicCompetitorsList()
  ]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03050b] text-white selection:bg-cyan-400/30 selection:text-cyan-50">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(rgba(232,121,249,0.045)_1px,transparent_1px)] bg-size-[52px_52px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.055)_0,rgba(255,255,255,0.055)_1px,transparent_1px,transparent_7px)]" />
      <div className="pointer-events-none absolute -left-48 top-0 h-[620px] w-[620px] rounded-full bg-cyan-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-48 top-0 h-[620px] w-[620px] rounded-full bg-fuchsia-500/15 blur-[140px]" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-32 text-center sm:px-6 sm:pb-16 sm:pt-36 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-[#09101a]/80 px-4 py-1.5 shadow-[0_0_18px_rgba(34,211,238,0.16)] backdrop-blur-md">
          <ArchiveBoxIcon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
          <span className="text-[11px] font-black uppercase italic tracking-[0.2em] text-cyan-100">
            Archivo Digital
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold uppercase italic leading-[0.85] tracking-[-0.04em] text-white drop-shadow-[3px_0_0_rgba(34,211,238,0.55),-3px_0_0_rgba(232,121,249,0.45)] sm:text-7xl md:text-8xl lg:text-[7rem]">
          Historial Competitivo
        </h1>

        <p className="mx-auto mt-5 max-w-3xl font-mono text-sm text-white/65 sm:text-base md:text-lg">
          {"// Registros y estadísticas desde el inicio de la liga."}
        </p>

        <div className="mx-auto mt-8 flex max-w-xl items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-linear-to-r from-transparent to-cyan-300/70" />
          <span className="h-1.5 w-16 bg-linear-to-r from-cyan-300 to-fuchsia-400 shadow-[0_0_12px_rgba(34,211,238,0.65)]" />
          <span className="h-px flex-1 bg-linear-to-l from-transparent to-fuchsia-300/70" />
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-7xl space-y-16 px-4 pb-24 sm:space-y-20 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingFallback text="Cargando Eventos Pasados..." />}>
          <EventosList events={eventsData} />
        </Suspense>

        <div className="h-px w-full bg-linear-to-r from-transparent via-fuchsia-400/35 to-transparent" />

        <Suspense fallback={<LoadingFallback text="Cargando Leyendas..." />}>
          <CompetidoresList competitors={competitorsData} />
        </Suspense>
      </div>
    </main>
  );
}