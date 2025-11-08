import { prisma } from "@/lib/prisma"; 
import EventForm from "@/components/admin/eventos/EventForm";

export default async function NuevoEventoPage() {
  const [regiones, comunas, eventTypes] = await Promise.all([
    prisma.region.findMany({
      orderBy: { id: "asc" },
    }),
    prisma.comuna.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.eventType.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-white">Nuevo evento</h1>
        <EventForm
          regiones={regiones}
          comunas={comunas}
          eventTypes={eventTypes}
        />
      </div>
    </div>
  );
}