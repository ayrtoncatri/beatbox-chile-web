import EventosList from "@/components/historial-competitivo/EventosList";
import CompetidoresList from "@/components/historial-competitivo/CompetidoresList";

export default function HistorialCompetitivoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
      <EventosList />
      <CompetidoresList />
    </main>
  );
}
