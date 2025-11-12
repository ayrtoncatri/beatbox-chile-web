import { prisma } from "@/lib/prisma";
import EventForm from "@/components/admin/eventos/EventForm";
import { notFound } from "next/navigation";
import { JudgeAssignmentForm } from "@/components/admin/eventos/JudgeAssignmentForm";
import { WildcardRankingTable } from "@/components/admin/eventos/WildcardRankingTable";
import { CompetitionCategoryForm } from "@/components/admin/eventos/CompetitionCategoryForm";
import { getInscritosForEvent } from "@/app/admin/eventos/actions";
import { InscritosTable } from "@/components/admin/eventos/InscritosTable";
import { BracketGenerator } from "@/components/admin/eventos/BracketGenerator";
import { RoundPhase, ScoreStatus } from "@prisma/client";
import { PreliminaryRankingTable, type RankingRowWithDetails } from "@/components/admin/eventos/PreliminaryRankingTable";

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

type AdminEditEventoPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type PreliminaryScoreAvg = {
  participantId: string;
  categoriaId: string;
  _avg: {
    totalScore: number | null;
  };
};

export default async function AdminEditEventoPage({ params }: AdminEditEventoPageProps) {
  const { id } = await params;

  const [evento, 
        regiones, 
        comunas, 
        eventTypes, 
        allJudges, 
        allCategories, 
        inscritos,
        preliminaryScoresAvg,
        allPreliminaryScores
      ] = await Promise.all([
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

    getInscritosForEvent(id),

    prisma.score.groupBy({
    by: ['participantId', 'categoriaId'],
    where: {
      eventoId: id,
      phase: RoundPhase.PRELIMINAR,
      status: ScoreStatus.SUBMITTED,
    },
    _avg: {
      totalScore: true,
    },
    orderBy: {
      _avg: {
        totalScore: 'desc',
      },
    },
  }),

  prisma.score.findMany({
      where: {
        eventoId: id,
        phase: RoundPhase.PRELIMINAR,
        status: ScoreStatus.SUBMITTED,
      },
      select: {
        participantId: true,
        categoriaId: true,
        judgeId: true,
        totalScore: true,
        judge: {
          select: {
            id: true,
            profile: { select: { nombres: true, apellidoPaterno: true } }
          }
        }
      }
    })
]);

  if (!evento) notFound();

  const serializedEvento = serializeData(evento);
  const serializedRegiones = serializeData(regiones);
  const serializedComunas = serializeData(comunas);
  const serializedEventTypes = serializeData(eventTypes);
  const serializedAllCategories = serializeData(allCategories);
  const serializedAllJudges = serializeData(allJudges);
  const serializedInscritos = serializeData(inscritos);
  const serializedAllPreliminaryScores = serializeData(allPreliminaryScores);

  const judgesList = serializedAllJudges || [];
  const activeCategories = serializedEvento.categories.map((c: any) => c.categoria) || [];

  const judgesWhoScoredMap = new Map<string, { id: string; name: string }>();
  (serializedAllPreliminaryScores as any[]).forEach(score => {
    if (score.judge && !judgesWhoScoredMap.has(score.judge.id)) {
      const name = `${score.judge.profile?.nombres || ''} ${score.judge.profile?.apellidoPaterno || ''}`.trim() || score.judge.id.slice(-4);
      judgesWhoScoredMap.set(score.judge.id, { id: score.judge.id, name });
    }
  });
  const uniqueJudges = Array.from(judgesWhoScoredMap.values());

  // 2. Unimos los promedios con los puntajes individuales
  const preliminaryRanking: RankingRowWithDetails[] = (preliminaryScoresAvg as PreliminaryScoreAvg[]).map(scoreAvg => {
    const inscrito = serializedInscritos.find((i: any) => i.userId === scoreAvg.participantId && i.categoriaId === scoreAvg.categoriaId);
    
    // Filtramos los scores individuales para este participante y categoría
    const participantScores = (serializedAllPreliminaryScores as any[]).filter(
      (s: any) => s.participantId === scoreAvg.participantId && s.categoriaId === scoreAvg.categoriaId
    );
    
    return {
      id: scoreAvg.participantId,
      nombreArtistico: inscrito?.nombreArtistico || `Usuario (${scoreAvg.participantId.slice(-4)})`,
      avgScore: scoreAvg._avg.totalScore ? Number(scoreAvg._avg.totalScore.toFixed(2)) : 0,
      categoriaId: scoreAvg.categoriaId,
      // Pasamos los scores detallados
      scores: participantScores.map((s: any) => ({
        judgeId: s.judgeId,
        score: s.totalScore
      }))
    };
  });

  return (
    <main className="min-h-screen py-4 sm:py-8 px-2 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
        {/* EventForm */}
        <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 sm:p-6 rounded-lg shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Editar evento</h1>
          <EventForm
            evento={serializedEvento}
            regiones={serializedRegiones}
            comunas={serializedComunas}
            eventTypes={serializedEventTypes}
          />
        </div>

        {/* CompetitionCategoryForm */}
        <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 sm:p-6 rounded-lg shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Configuración de Competición</h2>
          <CompetitionCategoryForm eventoId={id} allCategories={serializedAllCategories} />
        </div>

        {/* JudgeAssignmentForm */}
        <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 sm:p-6 rounded-lg shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Asignar Jueces</h2>
          <JudgeAssignmentForm
            eventoId={id}
            allJudges={judgesList}
            allCategories={serializedAllCategories}
          />
        </div>

        <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 sm:p-6 rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Ranking Preliminar (Showcase)</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <PreliminaryRankingTable 
              ranking={preliminaryRanking} 
              judges={uniqueJudges}
              allCategories={activeCategories}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 sm:p-6 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <BracketGenerator 
              eventoId={id} 
              activeCategories={activeCategories} 
            />
          </div>
        </div>

        {/* WildcardRankingTable */}
        <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 sm:p-6 rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Ranking de Wildcards</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <WildcardRankingTable eventoId={id} allCategories={activeCategories} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-4 sm:p-6 rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Participantes Inscritos</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <InscritosTable inscritos={serializedInscritos} allCategories={activeCategories} />
          </div>
        </div>
      </div>
    </main>
  );
}
