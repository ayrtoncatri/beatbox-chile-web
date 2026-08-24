'use client';

import { motion } from 'framer-motion';
import { Handle, Position } from 'reactflow';
import type { PublicBracketBattle } from '@/app/actions/public-data';

export function BracketMatch({ data }: {
    data:
    { battle: PublicBracketBattle;
      isFirstColumn: boolean;
      isFinalMatch: boolean;
      isSemifinal: boolean;
     } }) {
  const { battle, isFirstColumn, isFinalMatch, isSemifinal } = data;
  const { participantA, participantB, winnerId, winnerVotes, loserVotes } =
    battle;

  const isWinnerA = winnerId === participantA.id;
  const isWinnerB = winnerId === participantB.id;
  
  const borderColorClass = isFinalMatch
    ? 'border-[#D6160F]/50' // Borde ROJO para Final y 3er Lugar
    : 'border-[#0A37D2]/50'; // Borde AZUL para el resto

  return (
    <motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
  className={`
    relative w-64 h-[120px]   /* ← altura un poco mayor para evitar cortes */
    rounded-xl bg-gray-800/70 backdrop-blur-sm shadow-xl
    border-t-2 border-l-2 border-r-2 border-b-4
    ${borderColorClass}
  `}
>
  {/* Manija Izquierda (Entrada) */}
  {!isFirstColumn && (
    <Handle
      type="target"
      position={Position.Left}
      className="!absolute !w-px !h-px !-left-1 !bg-transparent !border-none"
    />
  )}

  {/* SEMIFINAL: dos salidas (ganador/ perdedor) */}
  {isSemifinal && (
    <>
      <Handle
        type="source"
        position={Position.Right}
        id="winner-out"
        className="!absolute !w-px !h-px !-right-1 !bg-transparent !border-none [top:25%]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="loser-out"
        className="!absolute !w-px !h-px !-right-1 !bg-transparent !border-none [top:75%]"
      />
    </>
  )}

  {/* NORMAL: una salida centrada */}
  {!isSemifinal && !isFinalMatch && (
    <Handle
      type="source"
      position={Position.Right}
      className="!absolute !w-px !h-px !-right-1 !bg-transparent !border-none [top:50%]"
    />
  )}

  {/* Marcador */}
  {winnerId && (
    <div className="absolute -top-2.5 right-2 bg-[#D6160F] text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md">
      {winnerVotes} - {loserVotes}
    </div>
  )}

  {/* CUERPO: grid con alturas fiables → no corta texto */}
  <div className="grid h-full grid-rows-[1fr_auto_1fr]">
    {/* Fila A */}
    <div
      className={`min-w-0 flex items-center justify-between px-3
        ${isWinnerA ? 'font-semibold text-white text-[0.95rem]' : 'text-gray-300'}
        ${!isWinnerA && winnerId ? 'opacity-40 line-through' : ''}`}
    >
      <span className="truncate">{participantA.name}</span>
      <span>{isWinnerA ? '🏆' : ''}</span>
    </div>

    {/* Divisor */}
    <div className={`border-t ${isFinalMatch ? 'border-[#D6160F]/20' : 'border-[#0A37D2]/20'} mx-3`} />

    {/* Fila B */}
    <div
      className={`min-w-0 flex items-center justify-between px-3
        ${isWinnerB ? 'font-semibold text-white text-[0.95rem]' : 'text-gray-300'}
        ${!isWinnerB && winnerId ? 'opacity-40 line-through' : ''}`}
    >
      <span className="truncate">{participantB.name || 'Próximo Rival...'}</span>
      <span>{isWinnerB ? '🏆' : ''}</span>
    </div>
  </div>
</motion.div>
  );
}