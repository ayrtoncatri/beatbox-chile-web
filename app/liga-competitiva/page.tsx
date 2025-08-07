import InfoCircuito from "@/components/liga-competitiva/InfoCircuito";
import Clasificados from "@/components/liga-competitiva/Clasificados";
import ReglasLiga from "@/components/liga-competitiva/ReglasLiga";
import Colaboradores from "@/components/liga-competitiva/Colaboradores";

export default function LigaCompetitivaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
      <h1 className="text-3xl font-extrabold text-blue-100 mb-8 text-center">
        Liga Competitiva
      </h1>
      <InfoCircuito />
      <Clasificados />
      <ReglasLiga />
      <Colaboradores />
    </main>
  );
}
