import {
  getCompetitorHistory,
  aggregateHistoryForTable,
} from "@/app/actions/public-data";
import { HistoryTable } from "@/components/historial-competitivo/HistoryTable";
import { CriteriaEvolutionChart } from "@/components/historial-competitivo/charts/CriteriaEvolutionChart";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { UserIcon, BoltIcon, TrophyIcon, StarIcon } from "@heroicons/react/24/solid"; // Importa StarIcon

interface HistorialPageProps {
  params: {
    userId: string;
  };
}

// Componente de Carga Estilizado
function LoadingComponent() {
  return (
    <div className="flex justify-center items-center h-96">
      {/* Colores de Chile en el spinner: Rojo, Blanco, Azul */}
      <div className="w-12 h-12 border-4 border-t-transparent border-red-500 border-r-white border-b-blue-500 rounded-full animate-spin"></div>
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
  const rawHistory = await getCompetitorHistory(userId);
  const aggregatedHistory = await aggregateHistoryForTable(rawHistory);

  // Determinamos el nombre artístico a mostrar
  const artisticName =
    user.inscripciones[0]?.nombreArtistico ||
    `${user.profile?.nombres || ""} ${
      user.profile?.apellidoPaterno || ""
    }`.trim() ||
    user.email;

  // Datos Adicionales (Mockup para la estética)
  const totalBattles = aggregatedHistory.length;
  // Corrección del error aquí: usar h.eventoId
  const totalEventsParticipated = rawHistory.length ? new Set(rawHistory.map(h => h.eventoId)).size : 0; 
  const isLegend = totalBattles > 10;


  return (
    // ESTILO FINAL: Fondo con gradiente sutil y brillo, usando colores de Chile
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-white/5 relative overflow-hidden text-white">
      
      {/* Fondo de Brillo y Textura (Ajustado a los colores de Chile) */}
      {/* Foco Azul - Más tenue, pero presente */}
      <div className="fixed top-[-15%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />
      {/* Foco Rojo - Más fuerte, para acentuar el rendimiento */}
      <div className="fixed top-[20%] left-[-10%] w-[600px] h-[600px] bg-red-900/30 rounded-full blur-[150px] pointer-events-none -z-10 opacity-70" />
      {/* Textura sutil para la profundidad */}
      <div className="fixed inset-0 bg-black/20 pointer-events-none z-10 opacity-30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />


      <div className="container mx-auto max-w-6xl py-20 px-4 md:px-8 relative z-20">
        
        {/* --- (3) Encabezado Estilizado (Ficha Técnica del Atleta) --- */}
        <div className="mb-12 border-l-4 border-white/50 pl-4"> {/* Borde blanco sutil */}
          
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-1 leading-none">
            {artisticName}
          </h1>
          
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-blue-400 drop-shadow-lg flex items-center gap-2"> {/* Título azul */}
              <UserIcon className="w-5 h-5 text-red-500" /> {/* Icono rojo */}
              Ficha de Atleta
            </h2>
             {isLegend && (
                <span className="flex items-center gap-1 text-sm font-black italic text-yellow-400 bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-500/50">
                    <TrophyIcon className="w-4 h-4" />
                    LEYENDA
                </span>
             )}
          </div>
        </div>

        {/* --- DATOS CLAVE (KPIs) - Con colores de Chile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <StatCard title="Batallas Registradas" value={totalBattles} icon={<BoltIcon className="w-5 h-5 text-red-500" />} color="red" />
            <StatCard title="Eventos Participados" value={totalEventsParticipated} icon={<TrophyIcon className="w-5 h-5 text-blue-500" />} color="blue" />
            <StatCard title="Mejor Posición" value={totalBattles > 0 ? "Top 4" : "N/A"} icon={<StarIcon className="w-5 h-5 text-white/80" />} color="white" />
        </div>


        {/* --- (4) Gráfico de Evolución --- */}
        <div className="mb-12">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white/90 mb-4 flex items-center gap-3">
            <BoltIcon className="w-6 h-6 text-red-500" />
            Evolución de Criterios <span className="text-sm font-normal text-white/50">(Promedio Jueces)</span>
          </h3>
          <div className="bg-[#0b1121]/60 backdrop-blur-md border border-blue-500/20 p-4 rounded-xl shadow-lg h-[450px] transition-all duration-300 hover:border-red-500/30">
            <Suspense fallback={<LoadingComponent />}>
              <CriteriaEvolutionChart historyData={rawHistory} /> 
            </Suspense>
          </div>
        </div>

        {/* --- (5) Componente de Tabla (Resumen de Participaciones) --- */}
        <div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white/90 mb-4 flex items-center gap-3">
            <TrophyIcon className="w-6 h-6 text-blue-500" />
            Registro de Batallas <span className="text-sm font-normal text-white/50">(Resultados Agregados)</span>
          </h3>
          <div className="bg-[#0b1121]/60 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:border-blue-500/30">
            <Suspense fallback={<LoadingComponent />}>
              <HistoryTable data={aggregatedHistory} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

// Componente Helper para las estadísticas clave (KPI) - CON VARIACIÓN DE COLOR
function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: 'red' | 'blue' | 'white' }) {
    let borderColor = '';
    let valueColor = '';
    let hoverShadow = '';

    switch(color) {
        case 'red':
            borderColor = 'border-red-500/30';
            valueColor = 'text-red-400';
            hoverShadow = 'shadow-red-500/20';
            break;
        case 'blue':
            borderColor = 'border-blue-500/30';
            valueColor = 'text-blue-400';
            hoverShadow = 'shadow-blue-500/20';
            break;
        case 'white':
            borderColor = 'border-white/30';
            valueColor = 'text-white';
            hoverShadow = 'shadow-white/20';
            break;
    }

    return (
        <div className={`bg-[#0b1121]/80 border ${borderColor} p-4 rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] hover:${hoverShadow}`}>
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <p className="text-xs font-black italic uppercase tracking-widest text-white/70">
                    {title}
                </p>
            </div>
            <p className={`text-3xl font-black font-mono tracking-tighter ${valueColor}`}>
                {value}
            </p>
        </div>
    );
}