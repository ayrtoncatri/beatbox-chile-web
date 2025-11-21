import EventosList from "@/components/historial-competitivo/EventosList";
import CompetidoresList from "@/components/historial-competitivo/CompetidoresList";
import { getPublicEventsList, getPublicCompetitorsList } from "@/app/actions/public-data";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ClockIcon } from "@heroicons/react/24/solid";

export const metadata: Metadata = {
  title: "Historial Competitivo | Beatbox Chile",
  description: "Revisa el archivo de la Liga Competitiva. Explora eventos pasados, rankings históricos y la trayectoria de los competidores más legendarios.",
  keywords: ["Historial Beatbox", "Archivo Torneos", "Eventos Pasados", "Legends", "Ranking Histórico"],
};

// Fallback estilizado para las cargas
function LoadingFallback({ text }: { text: string }) {
  return (
    <div className="flex justify-center items-center h-48 w-full p-4">
      <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mr-3"></div>
      <span className="text-white/60 font-mono text-sm uppercase tracking-widest">{text}</span>
    </div>
  );
}

// --- (2) Convertimos la página en 'async' ---
export default async function HistorialCompetitivoPage() {
  
  // --- (3) Obtenemos los datos en el servidor ---
  const [eventsData, competitorsData] = await Promise.all([
    getPublicEventsList(),
    getPublicCompetitorsList()
  ]);

  return (
    // CAMBIO CLAVE: Gradiente vertical de oscuro a más claro con acentos de color.
    // from-black -> via-[#0b1121] (Azul muy oscuro) -> to-fuchsia-950/20 (Un toque más claro abajo).
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0b1121] to-fuchsia-950/20 relative overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* LUCES AMBIENTALES (Opacidad aumentada para el brillo) */}
      {/* Foco Azul (Más brillante) */}
      <div className="fixed top-[-15%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />
      
      {/* Foco Fuchsia (Más visible) */}
      <div className="fixed top-[20%] left-[-10%] w-[600px] h-[600px] bg-fuchsia-900/20 rounded-full blur-[150px] pointer-events-none -z-10 opacity-70" />

      {/* HERO SECTION: Archivo Histórico */}
      <section className="relative pt-36 pb-20 px-4 text-center max-w-6xl mx-auto z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
          <ClockIcon className="w-4 h-4 text-white/70" />
          <span className="text-xs font-black italic tracking-widest text-white/80 uppercase">
            Archivo Digital
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none drop-shadow-2xl">
          Historial <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">Competitivo</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 font-light max-w-3xl mx-auto font-mono">
          // Registros y estadísticas desde el inicio de la liga.
        </p>
      </section>

      {/* CONTENIDO DE LISTAS */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-24 space-y-20">
        
        <Suspense fallback={<LoadingFallback text="Cargando Eventos Pasados..." />}>
          <EventosList events={eventsData} />
        </Suspense>

        {/* Divisor Visual */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />

        <Suspense fallback={<LoadingFallback text="Cargando Leyendas..." />}>
          <CompetidoresList competitors={competitorsData} />
        </Suspense>
        
      </div>
    </main>
  );
}