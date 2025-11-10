'use client';

import React from 'react';

type JudgeScore = {
  judgeId: string;
  score: number;
};

export type RankingRowWithDetails = {
  id: string;
  nombreArtistico: string;
  avgScore: number;
  scores: JudgeScore[]; // Array de puntajes individuales
};

type JudgeHeader = {
  id: string;
  name: string;
};

// Definimos el tipo de dato que esperamos para cada fila del ranking
type RankingRow = {
  id: string;
  nombreArtistico: string;
  avgScore: number;
  scores: JudgeScore[]; 
};

interface PreliminaryRankingTableProps {
  ranking: RankingRow[];
  judges: JudgeHeader[];
}

export function PreliminaryRankingTable({ ranking, judges }: PreliminaryRankingTableProps) {
  
  if (!ranking || ranking.length === 0) {
    return (
      <div className="text-center text-blue-300/70 p-4 border border-dashed border-blue-700/30 rounded-lg">
        Aún no hay puntajes finales (SUBMITTED) para la fase PRELIMINAR.
      </div>
    );
  }

  const totalParticipants = ranking.length;
  const getOpponentRank = (index: number) => {
    const isPowerOfTwo = totalParticipants > 0 && (totalParticipants & (totalParticipants - 1)) === 0;
    
    if (!isPowerOfTwo || (totalParticipants !== 8 && totalParticipants !== 16)) {
      return null; 
    }

    return totalParticipants - index;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-blue-700/30">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-blue-900/50 text-blue-200">
          <tr>
            <th className="p-3 font-semibold text-center w-16">#</th>
            <th className="p-3 font-semibold">Participante</th>
            {judges.map(judge => (
              <th key={judge.id} className="p-3 font-semibold text-center w-28 truncate" title={judge.name}>
                {/* Mostramos solo el primer nombre o inicial */}
                {judge.name.split(' ')[0]}
              </th>
            ))}
            <th className="p-3 font-semibold text-center w-28">Llave (vs)</th>
            <th className="p-3 font-semibold text-right w-32">Puntaje (Prom.)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-700/20">
          {ranking.map((participant, index) => {
            const rank = index + 1;
            const opponentRank = getOpponentRank(index);
            
            // Damos un color de fondo especial al Top 8 (si hay más)
            const rowClass = rank <= 8 ? 'bg-blue-800/30' : 'bg-blue-800/10';
            
            return (
              <tr key={participant.id} className={`transition hover:bg-blue-800/50 ${rowClass}`}>
                <td className="p-3 font-bold text-center text-white">{rank}</td>
                <td className="p-3 text-white">{participant.nombreArtistico}</td>
                {judges.map(judge => {
                  // Buscamos el puntaje de ESTE juez para ESTE participante
                  const score = participant.scores.find(s => s.judgeId === judge.id);
                  return (
                    <td key={judge.id} className="p-3 font-mono text-center text-white">
                      {score ? score.score : '—'}
                    </td>
                  );
                })}
                <td className="p-3 text-center text-blue-300">
                  {opponentRank ? `#${opponentRank}` : '—'}
                </td>
                <td className="p-3 font-mono text-right text-lg text-white">
                  {participant.avgScore.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}