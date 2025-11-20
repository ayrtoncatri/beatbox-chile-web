'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Criterio, ScoreStatus, RoundPhase, User, UserProfile, Score, ScoreDetail, Battle } from '@prisma/client';
import { declareBattleWinner } from '@/app/actions/judge/winner';
import { TrophyIcon, LockClosedIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import toast from 'react-hot-toast';
import { submitBulkScores } from '@/app/judge/actions'; 
import { SubmitScorePayload } from '@/lib/schemas/judging';

// --- Tipos de Props ---
// Importante: participantA ahora puede ser null en la DB, aunque en la UI de evaluación
// normalmente no entrarías a una batalla sin participantes, pero el tipo lo permite.
type FullBattle = Battle & {
  participantA: (User & { profile: UserProfile | null, inscripciones: { nombreArtistico: string | null }[] }) | null;
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
  initialScores: FullScore[];
}

// --- COMPONENTE AUXILIAR: DECLARAR GANADOR ---
function DeclareWinnerButton({ battleId, canDeclare }: { battleId: string, canDeclare: boolean }) {
  const initialState = { error: undefined, success: undefined, winnerName: undefined };
  const [state, dispatch] = useActionState(declareBattleWinner, initialState);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.success) toast.success(`${state.success}`);
    else if (state.error) toast.error(state.error);
  }, [state.success, state.error]);

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={dispatch} className="flex gap-2 items-center">
        <input type="hidden" name="battleId" value={battleId} />
        
        {!canDeclare && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-400/10 text-amber-200 border border-amber-400/20">
                <LockClosedIcon className="w-3 h-3" /> Requiere envío de puntajes
            </span>
        )}

        <button
          type="submit"
          disabled={!canDeclare || pending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-sky-600
            px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-900/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <TrophyIcon className="w-5 h-5" />
          {pending ? 'Declarando...' : 'Declarar Ganador'}
        </button>
      </form>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export function BattleScoreForm({
  battle,
  assignment,
  criterios,
  initialScores,
}: BattleScoreFormProps) {
  
  const [isPending, startTransition] = useTransition();
  const [activeRound, setActiveRound] = useState<1 | 2>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- 1. ESTADO DE LA MATRIZ DE PUNTAJES ---
  const [scores, setScores] = useState<Record<number, Record<string, Record<string, number>>>>(() => {
    const state: any = { 1: {}, 2: {} };
    // Filtramos solo los participantes que existen
    const participants = [battle.participantA, battle.participantB].filter(Boolean);

    [1, 2].forEach(round => {
       participants.forEach(p => {
          if (!p) return;
          state[round][p.id] = {};
          criterios.forEach(c => {
             const existing = initialScores.find(s => s.participantId === p.id && s.roundNumber === round);
             const detail = existing?.details.find(d => d.criterioId === c.id);
             state[round][p.id][c.id] = detail?.value ?? undefined;
          });
       });
    });
    return state;
  });

  useEffect(() => {
    const submittedCount = initialScores.filter(s => s.status === ScoreStatus.SUBMITTED).length;
    const expectedScores = battle.participantBId ? 4 : 2; 
    if (submittedCount >= expectedScores && expectedScores > 0) {
        setIsSubmitted(true);
    }
  }, [initialScores, battle.participantBId]);

  // --- 2. CÁLCULO DE TOTALES EN TIEMPO REAL ---
  // CORRECCIÓN AQUÍ: Aceptamos string | null | undefined
  const calculateTotal = (pId: string | null | undefined) => {
    if (!pId) return 0; // Si es null/undefined, retornamos 0

    let sum = 0;
    [1, 2].forEach(r => {
        const pScores = scores[r]?.[pId];
        if (pScores) {
            sum += Object.values(pScores).reduce((acc, val) => acc + (val || 0), 0);
        }
    });
    return sum;
  };

  // Ahora esto funciona porque calculateTotal acepta null
  const totalA = calculateTotal(battle.participantAId);
  const totalB = calculateTotal(battle.participantBId);

  // --- 3. AUTO-AVANCE DE ROUND ---
  useEffect(() => {
    if (activeRound === 2 || isSubmitted) return;

    // Necesitamos IDs válidos para verificar
    if (!battle.participantAId) return;

    const r1A = scores[1]?.[battle.participantAId];
    const r1B = battle.participantBId ? scores[1]?.[battle.participantBId] : {};

    const isR1Complete = criterios.every(c => 
        typeof r1A?.[c.id] === 'number' && 
        (!battle.participantBId || typeof r1B?.[c.id] === 'number')
    );

    if (isR1Complete) {
        const t = setTimeout(() => {
            setActiveRound(2);
            toast('Round 1 Completo → Pasando al Round 2', { 
                icon: '⏩', 
                style: { background: '#333', color: '#fff' } 
            });
        }, 800);
        return () => clearTimeout(t);
    }
  }, [scores, activeRound, battle, criterios, isSubmitted]);

  // --- 4. MANEJO DE INPUTS ---
  const handleInputChange = (round: number, pId: string | null | undefined, cId: string, valStr: string, max: number) => {
    if (isSubmitted || !pId) return; // Si no hay ID, no hacemos nada

    let val = parseInt(valStr);
    if (isNaN(val)) {
        setScores(prev => ({
            ...prev,
            [round]: { ...prev[round], [pId]: { ...prev[round][pId], [cId]: undefined as any } }
        }));
        return;
    }

    if (val > max) {
        val = max;
        toast.error(`Máximo ${max}`, { duration: 1000 });
    } else if (val < 0) val = 0;

    setScores(prev => ({
        ...prev,
        [round]: { ...prev[round], [pId]: { ...prev[round][pId], [cId]: val } }
    }));
  };

  // --- 5. ENVÍO MASIVO ---
  const isBattleComplete = useMemo(() => {
      const pIds = [battle.participantAId, battle.participantBId].filter(Boolean) as string[];
      if (pIds.length === 0) return false; // Si no hay participantes, no está completa

      return [1, 2].every(r => 
          pIds.every(pId => criterios.every(c => typeof scores[r]?.[pId]?.[c.id] === 'number'))
      );
  }, [scores, battle, criterios]);

  const handleSubmitBattle = () => {
    if (!isBattleComplete) return;
    const tId = toast.loading('Guardando batalla completa...');

    startTransition(async () => {
        const payloads: SubmitScorePayload[] = [];
        const pIds = [battle.participantAId, battle.participantBId].filter(Boolean) as string[];

        [1, 2].forEach(round => {
            pIds.forEach(pId => {
                const details = Object.entries(scores[round][pId] || {}).map(([cId, val]) => ({
                    criterioId: cId, value: val
                }));
                
                if (details.length > 0) {
                    payloads.push({
                        eventoId: assignment.eventoId,
                        categoriaId: assignment.categoriaId,
                        phase: assignment.phase,
                        battleId: battle.id,
                        participantId: pId,
                        roundNumber: round,
                        status: ScoreStatus.SUBMITTED,
                        scores: details
                    });
                }
            });
        });

        const res = await submitBulkScores(payloads);
        if (res.success) {
            setIsSubmitted(true);
            toast.success('¡Batalla Registrada!', { id: tId });
        } else {
            toast.error('Error al guardar', { id: tId });
        }
    });
  };

  // --- RENDERIZADO ---
  // Manejo seguro de nombres nulos
  const nameA = battle.participantA?.inscripciones?.[0]?.nombreArtistico 
             || battle.participantA?.profile?.nombres 
             || 'Esperando...';
             
  const nameB = battle.participantB?.inscripciones?.[0]?.nombreArtistico 
             || battle.participantB?.profile?.nombres 
             || (battle.participantBId ? '???' : 'Esperando...'); // Si hay ID pero no cargó datos vs si no hay ID

  const renderInputs = (pId: string | null | undefined, align: 'left' | 'right') => {
    if (!pId) return <div className="flex-1"></div>;
    
    return (
        <div className={`flex-1 space-y-4 ${align === 'right' ? 'items-end text-right' : ''}`}>
            {criterios.map(c => (
                <div key={c.id} className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'}`}>
                    <label className="text-[10px] uppercase tracking-wider text-blue-300/60 font-bold mb-1.5 flex items-center gap-1">
                        {c.name} 
                        <span className="text-fuchsia-500 opacity-80">/{c.maxScore}</span>
                    </label>
                    
                    <input 
                        type="number"
                        disabled={isSubmitted}
                        value={scores[activeRound][pId]?.[c.id] ?? ''}
                        onChange={(e) => handleInputChange(activeRound, pId, c.id, e.target.value, c.maxScore)}
                        onFocus={(e) => e.target.select()}
                        className={`w-full md:w-24 h-12 text-center text-xl font-bold bg-[#0c0c12] rounded-xl border 
                        transition-all focus:scale-105 focus:ring-2 focus:border-fuchsia-500
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                        ${isSubmitted ? 'border-green-500/30 text-green-400 opacity-70' : 'border-white/10 text-white hover:border-white/30'}`}
                    />
                </div>
            ))}
        </div>
    );
  };

  // Si no hay participantes en la batalla (ej: final vacía), mostramos un aviso
  if (!battle.participantAId && !battle.participantBId) {
    return (
        <div className="w-full p-8 bg-[#13131a]/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-white/30 gap-2">
            <LockClosedIcon className="w-8 h-8" />
            <p>Esta batalla aún no tiene participantes definidos.</p>
        </div>
    )
  }

  return (
    <div className="w-full space-y-6 bg-[#13131a]/40 border border-white/5 rounded-3xl p-1 overflow-hidden shadow-2xl">
      
      {/* HEADER */}
      <div className="px-6 py-5 bg-white/5 rounded-t-3xl flex justify-between items-center border-b border-white/5 backdrop-blur-xl">
         <div className={`text-center transition-all ${totalA > totalB ? 'scale-110' : 'opacity-70'}`}>
            <h3 className="text-lg font-black text-white uppercase truncate max-w-[120px] md:max-w-[200px]">{nameA}</h3>
            <div className="text-3xl font-extrabold text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">{totalA}</div>
         </div>
         
         <div className="flex flex-col items-center mx-2">
            <span className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">VS</span>
            {isSubmitted && (
                <span className="mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded border border-green-500/30 animate-pulse">
                    ENVIADO
                </span>
            )}
         </div>

         <div className={`text-center transition-all ${totalB > totalA ? 'scale-110' : 'opacity-70'}`}>
            <h3 className="text-lg font-black text-white uppercase truncate max-w-[120px] md:max-w-[200px]">{nameB}</h3>
            <div className="text-3xl font-extrabold text-fuchsia-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]">{totalB}</div>
         </div>
      </div>

      {/* TABS */}
      <div className="flex px-2 gap-2">
         {[1, 2].map(r => (
             <button 
                key={r}
                onClick={() => !isSubmitted && setActiveRound(r as 1|2)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border
                    ${activeRound === r 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                        : 'bg-transparent border-transparent text-white/30 hover:bg-white/5'}
                `}
             >
                Round {r}
             </button>
         ))}
      </div>

      {/* ÁREA DE INPUTS */}
      <div className="px-6 pb-6 min-h-[300px]">
         <AnimatePresence mode="wait">
            <motion.div 
                key={activeRound}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex justify-between gap-4 md:gap-12 relative"
            >
                {/* Participante A */}
                {renderInputs(battle.participantAId, 'left')}
                
                {/* Separador Central */}
                <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-white/5 to-transparent absolute left-1/2 -translate-x-1/2 h-full" />
                
                {/* Participante B */}
                {renderInputs(battle.participantBId, 'right')}
            </motion.div>
         </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="p-5 bg-black/20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
         
         {!isSubmitted ? (
             <button
                onClick={handleSubmitBattle}
                disabled={!isBattleComplete || isPending}
                className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                    ${isBattleComplete 
                        ? 'bg-white text-black hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                        : 'bg-white/5 text-white/30 cursor-not-allowed'}
                `}
             >
                {isPending ? 'Enviando...' : 'Confirmar Batalla'} <ArrowRightIcon className="w-4 h-4" />
             </button>
         ) : (
             <div className="text-green-400 flex items-center gap-2 text-sm font-bold bg-green-500/5 px-4 py-2 rounded-lg border border-green-500/10">
                 <CheckCircleIcon className="w-5 h-5" /> Resultados Confirmados
             </div>
         )}

         <DeclareWinnerButton 
            battleId={battle.id} 
            canDeclare={isSubmitted} 
         />
      </div>

    </div>
  );
}