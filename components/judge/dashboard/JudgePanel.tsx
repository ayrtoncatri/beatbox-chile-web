'use client' 

import { useState } from 'react'
import type { 
  JudgeAssignment, 
  Criterio, 
  Wildcard, 
  Score, 
  ScoreDetail, 
  User, 
  UserProfile, 
  Evento, 
  Categoria,
  Inscripcion, 
  Battle,
} from '@prisma/client'

import { RoundPhase } from '@prisma/client'

// --- (1) Importamos AMBOS formularios ---
import { JudgeScoreForm } from '@/components/judge/dashboard/JudgeScoreForm' 
import { BattleScoreForm } from '@/components/judge/dashboard/BattleScoreForm' // <-- DESCOMENTADO Y LISTO PARA FASE 10.6

// (Tus tipos "enriquecidos" se mantienen igual)
type FullJudgeAssignment = JudgeAssignment & { evento: Evento; categoria: Categoria }
type FullScore = Score & { details: ScoreDetail[] }
type FullParticipant = Inscripcion & { 
  user: (User & { profile: UserProfile | null });
  wildcard: { youtubeUrl: string } | null; 
}
type FullBattle = Battle & {
  participantA: User & { profile: UserProfile | null, inscripciones: { nombreArtistico: string | null }[] };
  participantB: (User & { profile: UserProfile | null, inscripciones: { nombreArtistico: string | null }[] }) | null;
}

// (La interfaz de Props se mantiene igual)
interface JudgePanelProps {
  assignments: FullJudgeAssignment[]
  allCriterios: Criterio[]
  participants: FullParticipant[] 
  battles: FullBattle[] 
  initialScores: FullScore[]
}

export function JudgePanel({ 
  assignments, 
  allCriterios, 
  participants, 
  battles, 
  initialScores
}: JudgePanelProps) {
  
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || '')
  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId)

  const isBattlePhase = selectedAssignment?.phase !== RoundPhase.WILDCARD && 
                        selectedAssignment?.phase !== RoundPhase.PRELIMINAR;

  const relevantCriterios = selectedAssignment
    ? allCriterios.filter(
        c => c.categoriaId === selectedAssignment.categoriaId
      )
    : []

  // --- LÓGICA DE SHOWCASE (WILDCARD / PRELIMINAR) ---
  const renderShowcaseForms = () => {
    if (!selectedAssignment) return null;
    
    const relevantParticipants = participants.filter(p => 
      p.eventoId === selectedAssignment.eventoId &&
      p.categoriaId === selectedAssignment.categoriaId
    );

    if (relevantParticipants.length === 0) {
      return <p className="text-gray-600">No hay participantes inscritos para evaluar en esta categoría/fase.</p>
    }

    return relevantParticipants.map(participant => {
      const existingScore = initialScores.find(s => 
        s.participantId === participant.userId &&
        s.eventoId === selectedAssignment.eventoId &&
        s.categoriaId === selectedAssignment.categoriaId &&
        s.phase === selectedAssignment.phase
      );
      
      const wildcardProp = {
        id: participant.id,
        userId: participant.userId,
        nombreArtistico: participant.nombreArtistico,
        youtubeUrl: participant.wildcard?.youtubeUrl || '', 
        user: participant.user,
      };

      return (
        <JudgeScoreForm
          key={participant.id}
          wildcard={wildcardProp as any}
          assignment={selectedAssignment}
          criterios={relevantCriterios}
          existingScore={existingScore || null}
        />
      );
    });
  };

  // --- LÓGICA DE BATALLAS (OCTAVOS, CUARTOS, etc.) ---
  const renderBattleForms = () => {
    if (!selectedAssignment) return null;

    const relevantBattles = battles.filter(b => 
      b.eventoId === selectedAssignment.eventoId &&
      b.categoriaId === selectedAssignment.categoriaId &&
      b.phase === selectedAssignment.phase
    ).sort((a, b) => a.orderInRound - b.orderInRound);

    if (relevantBattles.length === 0) {
      return <p className="text-gray-600">Las llaves de batalla para esta fase aún no han sido generadas por el administrador.</p>
    }

    // --- (2) Renderizar el BattleScoreForm real ---
    return relevantBattles.map(battle => {
      return (
        <BattleScoreForm
          key={battle.id}
          battle={battle}
          assignment={selectedAssignment}
          criterios={relevantCriterios}
          // Pasamos solo los scores de este juez para esta batalla
          initialScores={initialScores.filter(s => s.battleId === battle.id)} 
        />
      )
    });
  };

  return (
    // --- (3) APLICAR ESTILO DE PANEL DE ADMIN (CLARO) ---
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      
      {/* Selector de Tareas de Evaluación (Estilizado) */}
      <div>
        <label htmlFor="assignment" className="block text-sm font-semibold leading-6 text-gray-900">
          Selecciona una evaluación:
        </label>
        <select
          id="assignment"
          name="assignment"
          value={selectedAssignmentId}
          onChange={(e) => setSelectedAssignmentId(e.target.value)}
          // (Estilo de formulario de admin claro y moderno)
          className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm
                     ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                     focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {assignments.length === 0 && <option>No hay tareas</option>}
          {assignments.map(a => (
            <option key={a.id} value={a.id}>
              {a.evento.nombre} - {a.categoria.name} ({a.phase})
            </option>
          ))}
        </select>
      </div>

      <hr className="border-gray-200" />

      {/* --- (4) RENDERIZADO CONDICIONAL --- */}
      {selectedAssignment && (
        <div className="space-y-6">
          {isBattlePhase 
            ? renderBattleForms() 
            : renderShowcaseForms()
          }
        </div>
      )}
    </div>
  )
}