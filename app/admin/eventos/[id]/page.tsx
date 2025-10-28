import { prisma } from "@/lib/prisma";
import EventForm from "@/components/admin/eventos/EventForm";
import { notFound } from "next/navigation";

export default async function AdminEditEventoPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [evento, regiones, comunas, eventTypes] = await Promise.all([
    prisma.evento.findUnique({
      where: { id },
      include: {
        tipo: true,
        venue: {
          include: {
            address: {
              include: {
                comuna: {
                  include: {
                    region: true,
                  },
                },
              },
            },
          },
        },
        ticketTypes: {
          orderBy: {
            price: "asc",
          },
        },
      },
    }),
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


  if (!evento) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-2 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar evento</h1>
        <EventForm
          evento={evento}
          regiones={regiones}
          comunas={comunas}
          eventTypes={eventTypes}
        />
      </div>
    </main>
  );
}