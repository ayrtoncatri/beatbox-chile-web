'use client';

import React, { useState, useMemo } from 'react';

type JudgeScore = {
  judgeId: string;
  score: number;
};

export type RankingRowWithDetails = {
  id: string;
  nombreArtistico: string;
  avgScore: number;
  scores: JudgeScore[]; // Array de puntajes individuales
  categoriaId?: string; // Agregamos categoriaId para filtrar
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
  categoriaId?: string;
};

interface PreliminaryRankingTableProps {
  ranking: RankingRow[];
  judges: JudgeHeader[];
  allCategories: { id: string; name: string }[];
}

export function PreliminaryRankingTable({ ranking, judges, allCategories }: PreliminaryRankingTableProps) {
  const [selectedCategory, setSelectedCategory] = useState((allCategories && allCategories.length > 0) ? allCategories[0]?.name || '' : '');

  // Filtrar ranking por categoría seleccionada
  const filteredRanking = useMemo(() => {
    if (!selectedCategory) return ranking;
    
    const selectedCategoryObj = allCategories.find(cat => cat.name === selectedCategory);
    if (!selectedCategoryObj) return ranking;
    
    return ranking.filter(row => row.categoriaId === selectedCategoryObj.id);
  }, [ranking, selectedCategory, allCategories]);
  
  if (!allCategories.length) {
    return (
      <div className="text-center text-blue-300/70 p-4 border border-dashed border-blue-700/30 rounded-lg">
        Este evento no tiene categorías de competición definidas.
      </div>
    );
  }

  if (!filteredRanking || filteredRanking.length === 0) {
    return (
      <div className="space-y-4">
        {/* Selector de Categoría */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-blue-200">
          <label htmlFor="category" className="font-medium text-sm sm:text-base whitespace-nowrap">
            Categoría:
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto rounded-md border border-blue-700/50 bg-blue-950/50 text-blue-100 py-2 pl-3 pr-10 shadow-sm text-sm sm:text-base"
          >
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-center text-blue-300/70 p-4 border border-dashed border-blue-700/30 rounded-lg text-sm sm:text-base">
          Aún no hay puntajes finales (SUBMITTED) para la fase PRELIMINAR en esta categoría.
        </div>
      </div>
    );
  }

  const totalParticipants = filteredRanking.length;
  const getOpponentRank = (index: number) => {
    const isPowerOfTwo = totalParticipants > 0 && (totalParticipants & (totalParticipants - 1)) === 0;
    
    if (!isPowerOfTwo || (totalParticipants !== 8 && totalParticipants !== 16)) {
      return null; 
    }

    return totalParticipants - index;
  };

  return (
    <div className="space-y-4">
      {/* Selector de Categoría */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-blue-200">
        <label htmlFor="category" className="font-medium text-sm sm:text-base whitespace-nowrap">
          Categoría:
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto rounded-md border border-blue-700/50 bg-blue-950/50 text-blue-100 py-2 pl-3 pr-10 shadow-sm text-sm sm:text-base"
        >
          {allCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-blue-700/30 -mx-2 sm:mx-0">
        <table className="min-w-full text-xs sm:text-sm text-left">
          <thead className="bg-blue-900/50 text-blue-200">
            <tr>
              <th className="p-2 sm:p-3 font-semibold text-center w-12 sm:w-16">#</th>
              <th className="p-2 sm:p-3 font-semibold min-w-[120px]">Participante</th>
              {judges.map(judge => (
                <th key={judge.id} className="p-2 sm:p-3 font-semibold text-center w-20 sm:w-28 truncate" title={judge.name}>
                  {/* Mostramos solo el primer nombre o inicial */}
                  {judge.name.split(' ')[0]}
                </th>
              ))}
              <th className="p-2 sm:p-3 font-semibold text-center w-20 sm:w-28">Llave (vs)</th>
              <th className="p-2 sm:p-3 font-semibold text-right w-24 sm:w-32">Puntaje (Prom.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-700/20">
            {filteredRanking.map((participant, index) => {
            const rank = index + 1;
            const opponentRank = getOpponentRank(index);
            
            // Damos un color de fondo especial al Top 8 (si hay más)
            const rowClass = rank <= 8 ? 'bg-blue-800/30' : 'bg-blue-800/10';
            
            return (
              <tr key={participant.id} className={`transition hover:bg-blue-800/50 ${rowClass}`}>
                <td className="p-2 sm:p-3 font-bold text-center text-white">{rank}</td>
                <td className="p-2 sm:p-3 text-white truncate max-w-[150px] sm:max-w-none">{participant.nombreArtistico}</td>
                {judges.map(judge => {
                  // Buscamos el puntaje de ESTE juez para ESTE participante
                  const score = participant.scores.find(s => s.judgeId === judge.id);
                  return (
                    <td key={judge.id} className="p-2 sm:p-3 font-mono text-center text-white">
                      {score ? score.score : '—'}
                    </td>
                  );
                })}
                <td className="p-2 sm:p-3 text-center text-blue-300">
                  {opponentRank ? `#${opponentRank}` : '—'}
                </td>
                <td className="p-2 sm:p-3 font-mono text-right text-base sm:text-lg text-white">
                  {participant.avgScore.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
}