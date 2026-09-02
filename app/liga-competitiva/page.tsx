import InfoCircuito from "@/components/liga-competitiva/InfoCircuito";
import Clasificados from "@/components/liga-competitiva/Clasificados";
import ReglasLiga from "@/components/liga-competitiva/ReglasLiga";
import Colaboradores from "@/components/liga-competitiva/Colaboradores";
import LigasHero from "@/components/ligas/LigasHero";
import type { Metadata } from "next";

const SHOW_RANKING = false; //true para mostrar el ranking, false para no mostrarlo

export const metadata: Metadata = {
  title: "Liga Competitiva | Beatbox Chile",
  description: "La plataforma oficial de torneos de Beatbox en Chile. Ranking nacional, formación y gestión de competencias internacionales.",
  keywords: ["Beatbox Battles", "Torneos Chile", "Ranking Beatbox", "Liga Nacional", "Competencia Internacional"],
};

export default function LigaCompetitivaPage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-[#030409] text-white selection:bg-amber-300/30 selection:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(217,70,239,0.12),transparent_30%),radial-gradient(circle_at_85%_55%,rgba(34,211,238,0.1),transparent_32%)]" />
      <LigasHero active="competitiva" />

      <div id="circuito" className="relative z-10 space-y-20 py-20 sm:space-y-24 sm:py-28">
        <InfoCircuito />
        {SHOW_RANKING && <Clasificados />}
        <ReglasLiga />
      </div>
    </main>
  );
}