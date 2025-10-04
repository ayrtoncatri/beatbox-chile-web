import EstadisticasEventos from "@/components/estadisticas/EstadisticasEventos";
import EstadisticasCompetidor from "@/components/estadisticas/EstadisticasCompetidor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estadísticas | Beatbox Chile",
  description: "Consulta las estadísticas de competencias, ligas y eventos de Beatbox Chile. Analiza los puntajes y rankings de los competidores.",
  keywords: ["Beatbox Chile", "estadísticas", "competencias", "ligas", "ranking", "puntajes", "eventos beatbox"],
};

export default function EstadisticasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
      <EstadisticasEventos />
      <EstadisticasCompetidor />
    </main>
  );
}
