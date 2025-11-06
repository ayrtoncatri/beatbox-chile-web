// app/admin/eventos/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import EventForm from "@/components/admin/eventos/EventForm";
import { notFound } from "next/navigation";
import { JudgeAssignmentForm } from "@/components/admin/eventos/JudgeAssignmentForm";
import { WildcardRankingTable } from "@/components/admin/eventos/WildcardRankingTable";
import { CompetitionCategoryForm } from "@/components/admin/eventos/CompetitionCategoryForm";
import { getInscritosForEvent } from "@/app/admin/eventos/actions";
import { InscritosTable } from "@/components/admin/eventos/InscritosTable";
import { BracketGenerator } from "@/components/admin/eventos/BracketGenerator";

// Igual que antes
const serializeData = (data: any) => {
  if (!data) return data;
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "bigint") return value.toString();
      return value;
    })
  );
};

// ➜ Ajuste importante: params y searchParams como Promise
type AdminEditEventoPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminEditEventoPage({ params }: AdminEditEventoPageProps) {
  // ➜ Ahora sí: esperar params antes de usar sus propiedades
  const { id } = await params;

  const [evento, regiones, comunas, eventTypes, allJudges, allCategories, inscritos] = await Promise.all([
    prisma.evento.findUnique({
      where: { id },
      include: {
        categories: { include: { categoria: true } },
        tipo: true,
        venue: {
          include: {
            address: {
              include: {
                comuna: { include: { region: true } },
              },
            },
          },
        },
        ticketTypes: { orderBy: { price: "asc" } },
      },
    }),
    prisma.region.findMany({ orderBy: { id: "asc" } }),
    prisma.comuna.findMany({ orderBy: { name: "asc" } }),
    prisma.eventType.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { roles: { some: { role: { name: "judge" } } } },
      include: { roles: { include: { role: true } } },
    }),
    prisma.categoria.findMany({ orderBy: { name: "asc" } }),

    getInscritosForEvent(id)
  ]);

  if (!evento) notFound();

  const serializedEvento = serializeData(evento);
  const serializedRegiones = serializeData(regiones);
  const serializedComunas = serializeData(comunas);
  const serializedEventTypes = serializeData(eventTypes);
  const serializedAllCategories = serializeData(allCategories);
  const serializedAllJudges = serializeData(allJudges);
  const serializedInscritos = serializeData(inscritos);

  const judgesList = serializedAllJudges || [];
  const activeCategories = serializedEvento.categories.map((c: any) => c.categoria) || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-2 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* EventForm */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Editar evento</h1>
          <EventForm
            evento={serializedEvento}
            regiones={serializedRegiones}
            comunas={serializedComunas}
            eventTypes={serializedEventTypes}
          />
        </div>

        {/* CompetitionCategoryForm */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Configuración de Competición</h2>
          <CompetitionCategoryForm eventoId={id} allCategories={serializedAllCategories} />
        </div>

        {/* JudgeAssignmentForm */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Asignar Jueces</h2>
          <JudgeAssignmentForm
            eventoId={id}
            allJudges={judgesList}
            allCategories={serializedAllCategories}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <BracketGenerator 
            eventoId={id} 
            activeCategories={activeCategories} 
          />
        </div>

        {/* WildcardRankingTable */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Ranking de Wildcards</h2>
          <WildcardRankingTable eventoId={id} allCategories={activeCategories} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Participantes Inscritos</h2>
          <InscritosTable inscritos={serializedInscritos} />
        </div>
      </div>
    </main>
  );
}
