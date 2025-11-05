import { prisma } from "@/lib/prisma";
import EventForm from "@/components/admin/eventos/EventForm";
import { notFound } from "next/navigation";
import { JudgeAssignmentForm } from "@/components/admin/eventos/JudgeAssignmentForm";
import { WildcardRankingTable } from "@/components/admin/eventos/WildcardRankingTable";
import { CompetitionCategoryForm } from "@/components/admin/eventos/CompetitionCategoryForm";


function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      // Si el valor es una fecha, lo convierte a string ISO
      if (value instanceof Date) {
        return value.toISOString();
      }
      // Si el valor es un BigInt (puede estar en Prisma), lo convierte a string
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    })
  );
}
// Hacemos la definición de props más explícita
type AdminEditEventoPageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function AdminEditEventoPage({
  params: { id },
}: AdminEditEventoPageProps) {
  
  const serializeData = (data: any) => {
    return JSON.parse(
        JSON.stringify(data, (key, value) => {
            if (value instanceof Date) {
                return value.toISOString();
            }
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        })
    );
  };
  
  const [evento, regiones, comunas, eventTypes, allJudges, allCategories] = await Promise.all([
    prisma.evento.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            categoria: true,
          }
        },
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

    prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'judge', // Busca usuarios con el rol 'judge'
            },
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true, // <-- CORREGIDO: ahora trae el objeto Role completo
          },
        },
      },
    }),
    prisma.categoria.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!evento) notFound();

  const serializedEvento = serialize(evento);
  
  const serializedRegiones = serializeData(regiones);
  const serializedComunas = serializeData(comunas);
  const serializedEventTypes = serializeData(eventTypes);

  const judgesList = allJudges || []; 
  const activeCategories = serializedEvento.categories.map((c: any) => c.categoria) || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-2 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar evento</h1>
        <EventForm
          evento={serializedEvento}
          regiones={serializedRegiones}
          comunas={serializedComunas}
          eventTypes={serializedEventTypes}
        />
      </div>
      
      <div>
          <h2 className="text-2xl font-bold mb-6">Configuración de Competición</h2>
          <CompetitionCategoryForm
            eventoId={evento.id}
            allCategories={allCategories || []} // Todas las categorías (SOLO, LOOP, TAG)
          />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Asignar Jueces</h2>
        <JudgeAssignmentForm
          eventoId={evento.id}
          allJudges={judgesList} // <-- USAMOS LA LISTA LIMPIA
          allCategories={allCategories || []} // <-- USAMOS LA LISTA LIMPIA
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Ranking de Wildcards</h2>
        <WildcardRankingTable
          eventoId={evento.id}
          allCategories={activeCategories} // <-- USAMOS LA LISTA LIMPIA
        />
      </div>

      

    </main>
  );
}