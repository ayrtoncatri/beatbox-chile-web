'use client';

import { AggregatedHistoryRow } from '@/app/actions/public-data';
import { RoundPhase } from '@prisma/client';
import { FaCalendarAlt, FaHashtag, FaMedal, FaStar } from 'react-icons/fa';

interface HistoryTableProps {
  data: AggregatedHistoryRow[];
}

// (Helper para formatear las fases, puedes expandir esto)
function formatPhase(phase: RoundPhase) {
  switch (phase) {
    case 'WILDCARD': return 'Wildcard';
    case 'PRELIMINAR': return 'Showcase (Preliminar)';
    case 'OCTAVOS': return 'Octavos de Final';
    case 'CUARTOS': return 'Cuartos de Final';
    case 'SEMIFINAL': return 'Semifinal';
    case 'TERCER_LUGAR': return 'Batalla 3er Lugar';
    case 'FINAL': return 'Final';
    default: return phase;
  }
}

export function HistoryTable({ data }: HistoryTableProps) {
  
  // --- (1) Manejar el caso de que no haya historial ---
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        Este competidor aún no tiene un historial de participaciones evaluadas.
      </div>
    );
  }

  // --- (2) Renderizar la tabla ---
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        
        {/* --- (3) Encabezado Estilizado --- */}
        <thead className="bg-gray-700/50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Evento
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Categoría
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Fase
            </th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Nota Final (Prom.)
            </th>
          </tr>
        </thead>
        
        {/* --- (4) Cuerpo de la Tabla --- */}
        <tbody className="bg-gray-800/60 divide-y divide-gray-700">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-700/50 transition-colors">
              
              {/* Columna: Evento y Fecha */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-white">{row.eventName}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                  <FaCalendarAlt />
                  {new Date(row.eventDate).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </td>
              
              {/* Columna: Categoría */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-100 text-cyan-800">
                  {row.categoryName}
                </span>
              </td>

              {/* Columna: Fase */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <div className="flex items-center gap-1.5">
                  <FaMedal className={row.phase === 'FINAL' ? 'text-yellow-400' : 'text-gray-500'} />
                  {formatPhase(row.phase)}
                </div>
              </td>

              {/* Columna: Nota Final (Alineada a la derecha) */}
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-lg font-bold text-sky-400 flex items-center justify-end gap-1">
                  <FaStar />
                  {row.finalScore}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}