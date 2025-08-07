import EstadisticasEventos from "@/components/estadisticas/EstadisticasEventos";
import EstadisticasCompetidor from "@/components/estadisticas/EstadisticasCompetidor";

export default function EstadisticasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
      <EstadisticasEventos />
      <EstadisticasCompetidor />
    </main>
  );
}
