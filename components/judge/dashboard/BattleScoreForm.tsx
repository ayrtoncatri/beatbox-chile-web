'use client';

import { useState } from 'react';
import { Criterio, ScoreStatus, RoundPhase, User, UserProfile, Score, ScoreDetail, Battle } from '@prisma/client';
import { SingleRoundForm } from './SingleRoundForm';
import { useTransition } from 'react';
import { declareBattleWinner } from '@/app/actions/judge/winner';
import { TrophyIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { useActionState} from 'react';
import { useFormStatus } from 'react-dom';

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

function DeclareWinnerButton({ battleId, totalScoreA, totalScoreB, totalSubmittedRounds }: { battleId: string, totalScoreA: number, totalScoreB: number, totalSubmittedRounds: number }) {
  
  const initialState = { error: undefined, success: undefined, winnerName: undefined };
  const [state, dispatch] = useActionState(declareBattleWinner, initialState);
  const { pending } = useFormStatus();

  // Regla: Solo si los 4 formularios (2 rounds x 2 participantes) han sido enviados
  const canDeclare = totalSubmittedRounds === 4 && totalScoreA !== totalScoreB; 
  
  // (Asumo que el puntaje total del juez debe estar completo para declarar)

  // Feedback visual del ganador (solo si el juez actual no está pendiente)
  let winnerFeedback = '';
  if (state.winnerName) {
      winnerFeedback = `${state.winnerName} AVANZA`;
  } else if (totalScoreA > totalScoreB) {
      winnerFeedback = 'Ganador: Participante A';
  } else if (totalScoreB > totalScoreA) {
      winnerFeedback = 'Ganador: Participante B';
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={dispatch} className="flex gap-2">
        <input type="hidden" name="battleId" value={battleId} />
        
        {/* Muestra el mensaje de bloqueo */}
        {!canDeclare && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-yellow-100 text-yellow-800">
                <LockClosedIcon className="w-4 h-4" /> Enviar ambos Rounds primero.
            </span>
        )}

        <button
          type="submit"
          disabled={!canDeclare || pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white
                     shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrophyIcon className="w-5 h-5" />
          {pending ? 'Declarando...' : 'Declarar Ganador Final'}
        </button>
      </form>
      
      {/* Mensaje de Resultado */}
      {state.success && <p className="text-sm font-semibold text-green-600">{state.success} ({winnerFeedback})</p>}
      {state.error && <p className="text-sm font-semibold text-red-600">{state.error}</p>}
    </div>
  );
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
  const scoresR1A = initialScores.find
    (s => s.participantId === battle.participantAId && s.roundNumber === 1
    ) || null;

  const scoresR1B = initialScores.find
    (s => s.participantId === battle.participantBId && s.roundNumber === 1
    ) || null;
  const scoresR2A = initialScores.find
    (s => s.participantId === battle.participantAId && s.roundNumber === 2
    ) || null;
  const scoresR2B = initialScores.find
    (s => s.participantId === battle.participantBId && s.roundNumber === 2
    ) || null;

  // Totales
  const totalR1A = scoresR1A?.totalScore || 0;
  const totalR1B = scoresR1B?.totalScore || 0;
  const totalR2A = scoresR2A?.totalScore || 0;
  const totalR2B = scoresR2B?.totalScore || 0;

  const totalA = totalR1A + totalR2A;
  const totalB = totalR1B + totalR2B;

  const [submissionStatus, setSubmissionStatus] = useState({
    R1A: scoresR1A?.status === ScoreStatus.SUBMITTED,
    R1B: scoresR1B?.status === ScoreStatus.SUBMITTED,
    R2A: scoresR2A?.status === ScoreStatus.SUBMITTED,
    R2B: scoresR2B?.status === ScoreStatus.SUBMITTED,
  });

  // --- (SOLUCIÓN: Parte 3) ---
  // Creamos el handler del callback
  const handleScoreSubmitted = (participantId: string, roundNumber: 1 | 2) => {
    let key: keyof typeof submissionStatus;

    if (participantId === battle.participantAId && roundNumber === 1) key = 'R1A';
    else if (participantId === battle.participantBId && roundNumber === 1) key = 'R1B';
    else if (participantId === battle.participantAId && roundNumber === 2) key = 'R2A';
    else if (participantId === battle.participantBId && roundNumber === 2) key = 'R2B';
    else return; // Caso imposible

    // Actualizamos el estado, provocando un re-render
    setSubmissionStatus((prev) => ({
      ...prev,
      [key]: true, // Marcamos este round como enviado
    }));
  };

  // --- (SOLUCIÓN: Parte 4) ---
  // Recalculamos el total de envíos USANDO EL ESTADO, no las props.
  const totalSubmittedRounds = Object.values(submissionStatus).filter(Boolean).length;

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
              onScoreSubmitted={handleScoreSubmitted}
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
                onScoreSubmitted={handleScoreSubmitted}
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
              onScoreSubmitted={handleScoreSubmitted}
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
                onScoreSubmitted={handleScoreSubmitted}
              />
            )}
          </div>
        </div>
      </div>

      {/* TODO (Fase 10.7): Botón de "Declarar Ganador" */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
        <DeclareWinnerButton 
          battleId={battle.id}
          totalScoreA={totalA}
          totalScoreB={totalB}
          totalSubmittedRounds={totalSubmittedRounds}
        />
      </div>
    </div>
  );
}