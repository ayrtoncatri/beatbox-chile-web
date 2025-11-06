'use client';

import { useState } from 'react';
import { Criterio, ScoreStatus, RoundPhase, User, UserProfile, Score, ScoreDetail, Battle } from '@prisma/client';
import { SingleRoundForm } from './SingleRoundForm'; // (¡Crearemos este en el Paso 4!)

// --- Tipos de Props ---
type FullBattle = Battle & {
  participantA: User & { profile: UserProfile | null, inscripciones: { nombreArtistico: string | null }[] };
  participantB: (User & { profile: UserProfile | null, inscripciones: { nombreArtistico: string | null }[] }) | null;
}
type FullJudgeAssignment = {
  id: string;
  eventoId: string;
  categoriaId: string;
  phase: RoundPhase;
}
type FullScore = Score & { details: ScoreDetail[] };

interface BattleScoreFormProps {
  battle: FullBattle;
  assignment: FullJudgeAssignment;
  criterios: Criterio[];
  initialScores: FullScore[]; // Todos los scores (R1 y R2) de este juez para esta batalla
}

// --- (1) Componente "Contenedor" de Batalla ---
// Muestra las pestañas (Round 1 / Round 2) y el estado de la batalla
export function BattleScoreForm({
  battle,
  assignment,
  criterios,
  initialScores,
}: BattleScoreFormProps) {
  
  const [activeTab, setActiveTab] = useState<'R1' | 'R2'>('R1');

  // Nombres de los participantes
  const nameA = battle.participantA.inscripciones[0]?.nombreArtistico || battle.participantA.profile?.nombres || 'Participante A';
  const nameB = battle.participantB?.inscripciones[0]?.nombreArtistico || battle.participantB?.profile?.nombres || 'Participante B';
  
  // Scores de este juez para esta batalla
  const scoresR1A = initialScores.find(s => s.participantId === battle.participantAId && s.roundNumber === 1) || null;
  const scoresR1B = initialScores.find(s => s.participantId === battle.participantBId && s.roundNumber === 1) || null;
  const scoresR2A = initialScores.find(s => s.participantId === battle.participantAId && s.roundNumber === 2) || null;
  const scoresR2B = initialScores.find(s => s.participantId === battle.participantBId && s.roundNumber === 2) || null;

  // Totales
  const totalR1A = scoresR1A?.totalScore || 0;
  const totalR1B = scoresR1B?.totalScore || 0;
  const totalR2A = scoresR2A?.totalScore || 0;
  const totalR2B = scoresR2B?.totalScore || 0;

  const totalA = totalR1A + totalR2A;
  const totalB = totalR1B + totalR2B;

  return (
    <div className="rounded-lg border bg-white shadow-md overflow-hidden">
      {/* --- (2) Cabecera de la Batalla (Estilizada) --- */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          {/* Participante A */}
          <div className={`text-center p-2 ${totalA > totalB ? 'bg-green-100 rounded-lg' : ''}`}>
            <h3 className={`text-xl font-bold ${totalA > totalB ? 'text-green-700' : 'text-gray-900'}`}>{nameA}</h3>
            <span className="text-2xl font-bold text-blue-600">{totalA} pts</span>
          </div>
          
          <span className="text-gray-400 font-bold">VS</span>

          {/* Participante B */}
          <div className={`text-center p-2 ${totalB > totalA ? 'bg-green-100 rounded-lg' : ''}`}>
            <h3 className={`text-xl font-bold ${totalB > totalA ? 'text-green-700' : 'text-gray-900'}`}>{nameB}</h3>
            <span className="text-2xl font-bold text-blue-600">{totalB} pts</span>
          </div>
        </div>
        
        {/* --- (3) Pestañas (Tabs) para Round 1 / Round 2 --- */}
        <div className="mt-4 border-b border-gray-300">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('R1')}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'R1' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Round 1
            </button>
            <button
              onClick={() => setActiveTab('R2')}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'R2' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Round 2
            </button>
          </nav>
        </div>
      </div>

      {/* --- (4) Contenido de las Pestañas (Formularios) --- */}
      <div className="p-4 space-y-6">
        {/* Contenido de Round 1 */}
        <div className={activeTab === 'R1' ? 'block' : 'hidden'}>
          <div className="space-y-6">
            <SingleRoundForm
              battleId={battle.id}
              participantId={battle.participantAId}
              participantName={nameA}
              assignment={assignment}
              criterios={criterios}
              roundNumber={1}
              existingScore={scoresR1A}
            />
            {battle.participantBId && (
              <SingleRoundForm
                battleId={battle.id}
                participantId={battle.participantBId}
                participantName={nameB}
                assignment={assignment}
                criterios={criterios}
                roundNumber={1}
                existingScore={scoresR1B}
              />
            )}
          </div>
        </div>
        
        {/* Contenido de Round 2 */}
        <div className={activeTab === 'R2' ? 'block' : 'hidden'}>
          <div className="space-y-6">
            <SingleRoundForm
              battleId={battle.id}
              participantId={battle.participantAId}
              participantName={nameA}
              assignment={assignment}
              criterios={criterios}
              roundNumber={2}
              existingScore={scoresR2A}
            />
            {battle.participantBId && (
              <SingleRoundForm
                battleId={battle.id}
                participantId={battle.participantBId}
                participantName={nameB}
                assignment={assignment}
                criterios={criterios}
                roundNumber={2}
                existingScore={scoresR2B}
              />
            )}
          </div>
        </div>
      </div>

      {/* TODO (Fase 10.7): Botón de "Declarar Ganador" */}
    </div>
  );
}