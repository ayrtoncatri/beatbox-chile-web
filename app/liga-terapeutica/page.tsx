import type { Metadata } from "next";
import PropositoTerap from "@/components/liga-terapeutica/PropositoTerap";
import RegistroTerap from "@/components/liga-terapeutica/RegistroTerap";
import ContactoTerap from "@/components/liga-terapeutica/ContactoTerap";

export const metadata: Metadata = {
  title: "Liga Terapéutica | Beatbox Inclusivo",
  description: "Programa de intervención clínica y educativa que utiliza el beatbox para la estimulación comunicativa y la regulación emocional.",
  keywords: ["Beatbox Terapéutico", "Neuropsicología", "Inclusión", "Fonoaudiología", "Salud Mental", "Educación Especial"],
};

export default function LigaTerapeuticaPage() {
  return (
    // CAMBIO 1: Fondo base con un gradiente muy sutil desde arriba (Verde oscuro casi negro -> Negro)
    <main className="min-h-screen bg-gradient-to-b from-[#061410] via-[#050505] to-black relative overflow-hidden selection:bg-lime-500/30 selection:text-lime-200">
      
      {/* CAMBIO 2: Halo de luz central superior para separar el Header */}
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      
      {/* Luces ambientales laterales (ajustadas para dar profundidad) */}
      <div className="fixed top-[20%] left-0 w-[600px] h-[600px] bg-lime-900/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-lime-500/20 bg-lime-900/10 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(132,204,22,0.1)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
          </span>
          <span className="text-xs font-black italic tracking-widest text-lime-300 uppercase">
            Salud Mental & Arte
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-6 leading-tight drop-shadow-2xl">
          Beatbox <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-600">Inclusivo</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/70 font-light max-w-3xl mx-auto">
          "Ritmo, Voz y Regulación Emocional para la Inclusión"
        </p>
        <p className="text-sm md:text-base text-white/30 mt-4 max-w-2xl mx-auto uppercase tracking-widest font-medium">
          Programa Educacional Adaptado • Diseño Clínico • Neurodiversidad
        </p>
      </section>

      {/* Contenido */}
      <div className="relative z-10 space-y-32 pb-24">
        <PropositoTerap />
        <RegistroTerap />
        <ContactoTerap />
      </div>

    </main>
  );
}