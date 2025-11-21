import InfoCircuito from "@/components/liga-competitiva/InfoCircuito";
import Clasificados from "@/components/liga-competitiva/Clasificados";
import ReglasLiga from "@/components/liga-competitiva/ReglasLiga";
import Colaboradores from "@/components/liga-competitiva/Colaboradores";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liga Competitiva | Beatbox Chile",
  description: "La plataforma oficial de torneos de Beatbox en Chile. Ranking nacional, formación y gestión de competencias internacionales.",
  keywords: ["Beatbox Battles", "Torneos Chile", "Ranking Beatbox", "Liga Nacional", "Competencia Internacional"],
};

export default function LigaCompetitivaPage() {
  return (
    // CAMBIO CLAVE: Gradiente Vertical desde un Azul muy oscuro (#0b1121) hacia negro puro.
    // Esto crea la separación visual con el Header inmediatamente.
    <main className="min-h-screen bg-gradient-to-b from-[#0b1121] via-[#050505] to-black relative overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* --- FONDO IDENTIFICADOR "MIDNIGHT ARENA" --- */}

      {/* 1. Luz Cenital (El "Foco" del Escenario): Separa aún más el header y da profundidad al título */}
      <div className="fixed top-[-15%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />
      
      {/* 2. Energía Competitiva (Lado Izquierdo - Agresivo/Fuchsia) */}
      <div className="fixed top-[20%] left-[-10%] w-[600px] h-[600px] bg-fuchsia-900/10 rounded-full blur-[150px] pointer-events-none -z-10 opacity-60" />
      
      {/* 3. Profundidad Técnica (Lado Derecho - Cyan/Tech) */}
      <div className="fixed bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none -z-10 opacity-60" />

      {/* --- FIN FONDO --- */}

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-16 px-4 text-center max-w-6xl mx-auto">
        
        {/* Badge Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-900/10 backdrop-blur-md mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-xs font-black italic tracking-widest text-blue-300 uppercase">
            Official Battle Arena
          </span>
        </div>

        {/* Título Principal */}
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none drop-shadow-2xl">
          LIGA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-fuchsia-500 to-blue-500 animate-gradient-x">COMPETITIVA</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/60 font-light max-w-3xl mx-auto">
          "Formación de atletas, gestión de torneos y conexión global."
        </p>
        
        {/* Divisor visual sutil */}
        <div className="h-px w-40 mx-auto bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mt-10" />
      </section>

      {/* CONTENIDO */}
      <div className="relative z-10 space-y-24 pb-24">
        <InfoCircuito />
        <Clasificados />
        <ReglasLiga />
        <Colaboradores />
      </div>
    </main>
  );
}