import {
  getCompetitorHistory,
  aggregateHistoryForTable,
} from "@/app/actions/public-data";
import { HistoryTable } from "@/components/historial-competitivo/HistoryTable";
import { CriteriaEvolutionChart } from "@/components/historial-competitivo/charts/CriteriaEvolutionChart";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface HistorialPageProps {
  params: {
    userId: string;
  };
}

// Componente de Carga Estilizado
function LoadingComponent() {
  return (
    <div className="flex justify-center items-center h-96">
      <div className="w-12 h-12 border-4 border-t-transparent border-sky-500 rounded-full animate-spin"></div>
    </div>
  );
}

// Esta es una página de Servidor (Server Component)
export default async function HistorialCompetidorPage({
  params,
}: HistorialPageProps) {
  const { userId } = params;

  // --- (1) Obtenemos los datos del competidor ---
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      // Obtenemos el nombre artístico más reciente desde sus inscripciones
      inscripciones: {
        select: { nombreArtistico: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    notFound();
  }

  // --- (2) Obtenemos los datos de rendimiento (Fase 5) ---
  // Obtenemos el historial granular (todos los scores de todos los jueces)
  const rawHistory = await getCompetitorHistory(userId);
  // Obtenemos el historial agregado (promediado por evento/fase)
  const aggregatedHistory = await aggregateHistoryForTable(rawHistory);

  // Determinamos el nombre artístico a mostrar
  const artisticName =
    user.inscripciones[0]?.nombreArtistico ||
    `${user.profile?.nombres || ""} ${
      user.profile?.apellidoPaterno || ""
    }`.trim() ||
    user.email;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-12 px-4 md:px-8 text-white">
      <div className="container mx-auto max-w-6xl">
        {/* --- (3) Encabezado Estilizado --- */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Historial Competitivo
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-sky-400 drop-shadow-lg">
            {artisticName}
          </h2>
        </div>

        {/* --- (4) Componente de Gráfico (Cliente) --- */}
        {/* Este gráfico necesita los datos 'raw' para procesar los criterios */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Evolución de Criterios (Promedio Jueces)
          </h3>
          <div className="bg-gray-800/40 backdrop-blur-sm border border-blue-400/20 p-4 rounded-2xl shadow-lg h-96">
            <Suspense fallback={<LoadingComponent />}>
              <CriteriaEvolutionChart historyData={rawHistory} />
            </Suspense>
          </div>
        </div>

        {/* --- (5) Componente de Tabla (Cliente) --- */}
        {/* Esta tabla necesita los datos 'agregados' */}
        <div>
          <h3 className="text-2xl font-semibold text-white mb-4">
            Resumen de Participaciones
          </h3>
          <div className="bg-gray-800/40 backdrop-blur-sm border border-blue-400/20 rounded-2xl shadow-lg overflow-hidden">
            <Suspense fallback={<LoadingComponent />}>
              <HistoryTable data={aggregatedHistory} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}