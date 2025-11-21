'use client';

import { AggregatedHistoryRow } from '@/app/actions/public-data';
import { RoundPhase } from '@prisma/client';
import { 
  CalendarDaysIcon, 
  TagIcon, 
  MapPinIcon, 
  StarIcon, 
  TrophyIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/solid';

interface HistoryTableProps {
  data: AggregatedHistoryRow[];
}

// (Helper para formatear las fases)
function formatPhase(phase: RoundPhase) {
  switch (phase) {
    case 'WILDCARD': return 'Wildcard';
    case 'PRELIMINAR': return 'Showcase (Preliminar)';
    case 'OCTAVOS': return 'Octavos de Final';
    case 'CUARTOS': return 'Cuartos de Final';
    case 'SEMIFINAL': return 'Semifinal';
    case 'TERCER_LUGAR': return 'Batalla 3er Lugar';
    case 'FINAL': return 'Final de Campeonato';
    default: return phase;
  }
}

export function HistoryTable({ data }: HistoryTableProps) {
  
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-white/50 font-mono italic">
        <CheckCircleIcon className="w-8 h-8 mx-auto text-blue-500/50 mb-3" />
        Este competidor aún no tiene un historial de participaciones evaluadas.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative z-10">
      <table className="min-w-full divide-y divide-white/10">
        
        {/* Encabezado */}
        <thead className="bg-black/80 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-black italic text-blue-400 uppercase tracking-widest border-b border-blue-500/50">
              Evento / Lugar
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-black italic text-red-400 uppercase tracking-widest border-b border-red-500/50">
              Categoría / Fase
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-black italic text-white/80 uppercase tracking-widest border-b border-white/50">
              Fecha
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-black italic text-red-400 uppercase tracking-widest border-b border-red-500/50">
              Nota Final
            </th>
          </tr>
        </thead>
        
        {/* Cuerpo de la Tabla */}
        <tbody className="divide-y divide-white/5">
          {data.map((row) => {
            const isFinal = row.phase === 'FINAL';
            const rowClass = isFinal ? 'bg-red-900/10 hover:bg-red-900/20' : 'hover:bg-blue-900/10';

            return (
              <tr key={row.id} className={`transition-colors ${rowClass}`}>
                
                {/* Columna: Evento y Lugar (Azul/Blanco) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-black italic text-white uppercase tracking-tight">
                    {row.eventName}
                  </div>
                  <div className="text-xs text-blue-400 flex items-center gap-1.5 mt-1">
                    <MapPinIcon className="w-3 h-3" />
                    {row.venueName}
                    {/* --- NUEVA INFORMACIÓN GEOGRÁFICA --- */}
                    {row.comunaName && row.regionName && (
                        <span className="text-white/60 font-mono text-[10px] ml-1">
                            ({row.comunaName}, {row.regionName})
                        </span>
                    )}
                  </div>
                </td>
                
                {/* Columna: Categoría y Fase (Rojo y Blanco) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                  <div className="font-medium">
                    <TagIcon className="w-3 h-3 inline-block text-white/50 mr-1.5" />
                    {row.categoryName}
                  </div>
                  <div className="text-xs text-red-400 font-mono uppercase mt-1">
                    <TrophyIcon className={`w-3 h-3 inline-block mr-1.5 ${isFinal ? 'text-yellow-400' : 'text-red-400'}`} />
                    {formatPhase(row.phase)}
                  </div>
                </td>

                {/* Columna: Fecha (Azul) */}
                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-blue-300">
                  <CalendarDaysIcon className="w-3 h-3 inline-block text-blue-500 mr-1.5" />
                  {new Date(row.eventDate).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>

                {/* Columna: Nota Final (Valor Destacado - Rojo) */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-xl font-black italic text-red-400 flex items-center justify-end gap-1">
                    <StarIcon className="w-4 h-4 text-white/80" />
                    {row.finalScore.toFixed(1)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    / 10.0
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}