'use server';

import { prisma } from '@/lib/prisma';
import { Prisma, RoundPhase, InscripcionSource } from '@prisma/client';
import { groupBy, meanBy } from 'lodash'; // 'lodash' ya está en tu package.json

// ===============================================
// TIPOS DE DATOS SERIALIZADOS
// (Estos tipos se usarán en las páginas de Fase 6-9)
// ===============================================

// Para components/historial-competitivo/EventosList.tsx
export type PublicEventListData = Awaited<ReturnType<typeof getPublicEventsList>>;

// Para components/historial-competitivo/CompetidoresList.tsx
export type PublicCompetitorListData = Awaited<ReturnType<typeof getPublicCompetitorsList>>;

// Para components/estadisticas/EstadisticasEventos.tsx
export type GlobalEventStatsData = Awaited<ReturnType<typeof getEventStats>>;

// Para components/estadisticas/EstadisticasCompetidor.tsx
export type GlobalCompetitorStatsData = Awaited<ReturnType<typeof getCompetitorStats>>;

// Para components/estadisticas/EstadisticasJueces.tsx
export type GlobalJudgeStatsData = Awaited<ReturnType<typeof getJudgeStats>>;

// Para app/historial-competitivo/eventos/[id]/page.tsx
export type EventDetailsData = Awaited<ReturnType<typeof getEventDetails>>;

// Para app/historial-competitivo/competidores/[userId]/page.tsx
// (Definimos la forma de los datos del historial granular)
type FullScoreHistory = Prisma.ScoreGetPayload<{
  include: {
    evento: { include: { tipo: true } };
    categoria: true;
    details: { include: { criterio: true } };
  };
}>;

// Este es el tipo que el componente cliente recibirá (con fechas como strings)
export type SerializedHistoryResult = Omit<FullScoreHistory, 'createdAt' | 'updatedAt' | 'evento'> & {
  createdAt: string;
  updatedAt: string;
  evento: Omit<FullScoreHistory['evento'], 'fecha' | 'wildcardDeadline'> & {
    fecha: string;
    wildcardDeadline: string | null;
  };
};

// Para components/historial-competitivo/HistoryTable.tsx
export interface AggregatedHistoryRow {
  id: string;
  eventName: string;
  eventDate: string; // ISO String
  categoryName: string;
  phase: RoundPhase;
  finalScore: number;
}


// ===============================================
// FUNCIONES DEL MOTOR DE DATOS PÚBLICOS
// ===============================================

/**
 * FASE 6: Obtiene la lista de eventos para la página de historial.
 */
export async function getPublicEventsList() {
  const events = await prisma.evento.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      nombre: true,
      fecha: true,
      venue: { select: { name: true } },
    },
    orderBy: { fecha: 'desc' },
    take: 6, // Límite para la landing page
  });
  
  // Serializar fechas para el cliente
  return events.map(ev => ({
    ...ev,
    fecha: ev.fecha.toISOString(),
    venue: { name: ev.venue?.name || 'Online' } // Manejar venue nulo
  }));
}

/**
 * FASE 6: Obtiene la lista de competidores destacados (por ej. más inscripciones).
 */
export async function getPublicCompetitorsList() {
  const competitors = await prisma.user.findMany({
    where: { inscripciones: { some: {} } }, // Solo usuarios que se han inscrito a algo
    select: {
      id: true,
      profile: { select: { nombres: true, apellidoPaterno: true } },
      // Tomamos el nombre artístico más reciente
      inscripciones: { 
        select: { nombreArtistico: true },
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      // Contamos las inscripciones para el "logro"
      _count: {
        select: { inscripciones: true }
      }
    },
    orderBy: {
      inscripciones: {
        _count: 'desc' // Ordenar por más participaciones
      }
    },
    take: 4, // Límite para la landing page
  });

  return competitors.map(c => {
    const artisticName = c.inscripciones[0]?.nombreArtistico || 
                         `${c.profile?.nombres || ''} ${c.profile?.apellidoPaterno || ''}`.trim() ||
                         'Competidor';
    return {
      id: c.id,
      nombre: artisticName,
      logros: `${c._count.inscripciones} participaciones`,
      destacado: c._count.inscripciones > 0,
    };
  });
}

/**
 * FASE 7: Obtiene estadísticas globales de eventos.
 */
export async function getEventStats() {
  const eventStats = await prisma.evento.aggregate({
    _count: { id: true },
    _sum: { asistencia: true },
    where: { isPublished: true },
  });

  const participantCount = await prisma.inscripcion.groupBy({
    by: ['userId'],
  });

  // Lógica de "Último Ganador" (del CN más reciente)
  const lastCN = await prisma.evento.findFirst({
    where: { tipo: { name: "Campeonato Nacional" } },
    orderBy: { fecha: 'desc' },
  });
  
  let lastWinner = 'N/A';
  if (lastCN) {
    const winnerScore = await prisma.score.findFirst({
      where: { eventoId: lastCN.id, phase: 'FINAL' },
      orderBy: { totalScore: 'desc' },
      include: { participant: { include: { inscripciones: { select: { nombreArtistico: true }, take: 1 } } } }
    });
    if (winnerScore) {
      lastWinner = winnerScore.participant.inscripciones[0]?.nombreArtistico || 'Ganador';
    }
  }

  return {
    totalEventos: eventStats._count.id,
    publicoTotal: eventStats._sum.asistencia || 0,
    totalParticipantes: participantCount.length,
    ultimoGanadorCN: lastWinner,
  };
}

/**
 * FASE 7: Obtiene estadísticas globales de competidores.
 */
export async function getCompetitorStats() {
  // Obtenemos participaciones (Inscripciones)
  const participations = await prisma.inscripcion.groupBy({
    by: ['userId'],
    _count: { id: true },
  });

  // Obtenemos nota promedio (Scores)
  const avgScores = await prisma.score.groupBy({
    by: ['participantId'],
    _avg: { totalScore: true },
  });
  const avgScoresMap = new Map(avgScores.map(s => [s.participantId, s._avg.totalScore]));

  // Obtenemos "victorias" (Top 3 de Ligas/CN)
  const wins = await prisma.inscripcion.groupBy({
    by: ['userId'],
    _count: { id: true },
    where: {
      source: {
        in: [
          InscripcionSource.LIGA_ONLINE_TOP3,
          InscripcionSource.LIGA_PRESENCIAL_TOP3,
          InscripcionSource.CN_HISTORICO_TOP3
        ]
      }
    }
  });
  const winsMap = new Map(wins.map(w => [w.userId, w._count.id]));

  // Obtenemos nombres
  const userIds = participations.map(p => p.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, inscripciones: { select: { nombreArtistico: true }, take: 1, orderBy: { createdAt: 'desc' } } }
  });
  const userMap = new Map(users.map(u => [u.id, u.inscripciones[0]?.nombreArtistico || 'N/A']));

  // Combinamos todo
  return participations.map(p => ({
    nombre: userMap.get(p.userId) || 'Competidor',
    participaciones: p._count.id,
    notaPromedio: parseFloat(avgScoresMap.get(p.userId)?.toFixed(2) || '0'),
    victorias: winsMap.get(p.userId) || 0,
  })).sort((a, b) => b.victorias - a.victorias); // Ordenar por victorias
}

/**
 * FASE 7: Obtiene estadísticas globales de jueces.
 */
export async function getJudgeStats() {
  const judgeAssignments = await prisma.judgeAssignment.groupBy({
    by: ['judgeId'],
    _count: { eventoId: true }, // Esto cuenta asignaciones, no eventos únicos
    orderBy: { _count: { eventoId: 'desc' } },
  });

  const userIds = judgeAssignments.map(j => j.judgeId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, profile: { select: { nombres: true, apellidoPaterno: true } } }
  });
  const userMap = new Map(users.map(u => [u.id, `${u.profile?.nombres || ''} ${u.profile?.apellidoPaterno || ''}`.trim() || 'Juez']));

  return judgeAssignments.map(j => ({
    nombre: userMap.get(j.judgeId) || 'Juez',
    eventosJuzgados: j._count.eventoId,
  }));
}

/**
 * FASE 8: Obtiene los detalles de UN evento (incluyendo inscritos).
 */
export async function getEventDetails(eventId: string) {
  const event = await prisma.evento.findUnique({
    where: { id: eventId },
    include: {
      tipo: true,
      venue: { include: { address: { include: { comuna: true } } } },
      
      // Lista de Jueces (de JudgeAssignment)
      assignments: {
        select: { judge: { select: { id: true, profile: {select: {nombres: true, apellidoPaterno: true}} } } },
        distinct: ['judgeId']
      },

      // Lista de Participantes (de Inscripcion)
      inscripciones: {
        select: {
          user: { select: { id: true } },
          nombreArtistico: true,
          source: true
        },
        orderBy: { nombreArtistico: 'asc' }
      }
    }
  });

  if (!event) return null;
  const { venue, assignments, inscripciones, ...rest } = event;
  
  const local = venue 
    ? `${venue.name}, ${venue.address?.comuna?.name || 'N/A'}` 
    : 'Online';
  
  const jueces = assignments.map(a => ({
    id: a.judge.id,
    nombre: `${a.judge.profile?.nombres || ''} ${a.judge.profile?.apellidoPaterno || ''}`.trim() || 'Juez'
  }));
  
  const participantes = inscripciones.map(i => ({
    id: i.user.id,
    nombre: i.nombreArtistico || 'Participante',
    via: i.source // (ej. 'WILDCARD', 'LIGA_ADMIN')
  }));

  return {
    ...rest,
    fecha: event.fecha.toISOString(), // Serializar
    local,
    jueces,
    participantes,
    auspiciadores: event.sponsors, 
    premios: event.premios,
  };
}

/**
 * FASE 9: Obtiene el historial completo de Scores de UN competidor.
 */
export async function getCompetitorHistory(userId: string): Promise<SerializedHistoryResult[]> {
  const history = await prisma.score.findMany({
    where: { 
      participantId: userId,
      status: 'SUBMITTED' // Solo mostrar puntajes finales
    },
    include: {
      evento: { include: { tipo: true } }, // Contexto del evento
      categoria: true, // Contexto de categoría
      details: { include: { criterio: true } }, // Detalle granular
    },
    orderBy: { evento: { fecha: 'desc' } }, // Más reciente primero
  });

  // Serialización profunda de fechas para el cliente
  return history.map(score => ({
    ...score,
    createdAt: score.createdAt.toISOString(),
    updatedAt: score.updatedAt.toISOString(),
    evento: {
      ...score.evento,
      fecha: score.evento.fecha.toISOString(),
      wildcardDeadline: score.evento.wildcardDeadline
        ? score.evento.wildcardDeadline.toISOString()
        : null,
    },
  })) as unknown as SerializedHistoryResult[]; // Forzamos el tipo
}

/**
 * FASE 9: Helper para agregar el historial de scores para la tabla.
 */
export async function aggregateHistoryForTable(
  history: SerializedHistoryResult[]
): Promise<AggregatedHistoryRow[]>{
  // Agrupamos por participación (ej. "Final - CN 2024")
  const groupedByParticipation = groupBy(history, 
    (score) => `${score.eventoId}-${score.phase}-${score.categoriaId}`
  );

  const aggregatedRows: AggregatedHistoryRow[] = Object.values(groupedByParticipation).map(scoresInGroup => {
    // Todos los scores en este grupo comparten evento, fase y categoría
    const firstScore = scoresInGroup[0];
    
    // Calculamos el promedio de la nota total de todos los jueces
    const averageScore = meanBy(scoresInGroup, 'totalScore');
    
    return {
      id: `${firstScore.eventoId}-${firstScore.phase}`,
      eventName: firstScore.evento.nombre,
      eventDate: firstScore.evento.fecha, // Ya es string ISO
      categoryName: firstScore.categoria.name,
      phase: firstScore.phase,
      finalScore: parseFloat(averageScore.toFixed(2)), // Redondeamos
    };
  });
  
  // Ordenamos por fecha (más reciente primero)
  return aggregatedRows.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
}