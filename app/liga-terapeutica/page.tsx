import type { Metadata } from "next";
import PropositoTerap from "@/components/liga-terapeutica/PropositoTerap";
import RegistroTerap from "@/components/liga-terapeutica/RegistroTerap";
import ContactoTerap from "@/components/liga-terapeutica/ContactoTerap";
import LigasHero from "@/components/ligas/LigasHero";

export const metadata: Metadata = {
  title: "Liga Terapéutica | Beatbox Inclusivo",
  description: "Programa de intervención clínica y educativa que utiliza el beatbox para la estimulación comunicativa y la regulación emocional.",
  keywords: ["Beatbox Terapéutico", "Neuropsicología", "Inclusión", "Fonoaudiología", "Salud Mental", "Educación Especial"],
};

export default function LigaTerapeuticaPage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-[#020807] text-white selection:bg-emerald-300/30 selection:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_85%_55%,rgba(34,211,238,0.1),transparent_32%)]" />
      <LigasHero active="terapeutica" />

      <div id="programa" className="relative z-10 space-y-20 py-20 sm:space-y-24 sm:py-28">
        <PropositoTerap />
        <RegistroTerap />
        <ContactoTerap />
      </div>

    </main>
  );
}