'use client';

import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  TrophyIcon, 
  StarIcon, 
  MicrophoneIcon,
  ChartBarIcon,
  ChevronDownIcon // Icono para "Ver Más"
} from '@heroicons/react/24/solid';
import { GlobalCompetitorStatsData } from '@/app/actions/public-data';
import { useState } from 'react'; // Importamos useState

interface EstadisticasCompetidorProps {
  stats: GlobalCompetitorStatsData;
}

const ITEMS_PER_PAGE = 5; // Mostrar 5 competidores inicialmente

export default function EstadisticasCompetidor({ stats }: EstadisticasCompetidorProps) {
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <section className="relative z-10">
      
      {/* Header de Sección */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full" />
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Performers</span>
          </h2>
        </div>
        
        {/* Etiqueta decorativa */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-indigo-300/50 uppercase tracking-widest bg-indigo-900/10 px-3 py-1 rounded border border-indigo-500/20">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Data
        </div>
      </div>

      {/* Grid de Tarjetas de Atleta */}
      <div className="grid grid-cols-1 gap-4">
        
        {stats.slice(0, visibleItems).map((c, i) => { // Usamos .slice() para controlar cuántos se muestran
          // Corrección del error: c.notaPromedio ya es un número.
          const ratingPercent = (c.notaPromedio / 10) * 100; 
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-xl bg-[#0f172a]/40 border border-white/5 hover:border-indigo-500/30 hover:bg-[#0f172a]/60 transition-all duration-300"
            >
              {/* Fondo Gradiente Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
                
                {/* Ranking Number (Badge Lateral) */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 font-black italic text-2xl text-white/80 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
                  #{i + 1}
                </div>

                {/* Avatar e Info Principal */}
                <div className="flex items-center gap-4 flex-grow w-full md:w-auto">
                  <div className="relative">
                     <UserCircleIcon className="w-14 h-14 text-indigo-300/50 group-hover:text-indigo-400 transition-colors" />
                     {/* Indicador de Estado (Top 3) */}
                     {i < 3 && (
                       <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg shadow-yellow-500/20">
                         TOP
                       </div>
                     )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                      {c.nombre}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/40 font-mono uppercase">
                      <span>ID: 00{i + 1}-BX</span>
                      <span className="text-indigo-500">•</span>
                      <span>Active</span>
                    </div>
                  </div>
                </div>

                {/* Métricas (Grid Interno) */}
                <div className="grid grid-cols-3 gap-4 w-full md:w-auto md:min-w-[400px]">
                  
                  {/* Stat 1: Victorias */}
                  <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/40 font-bold uppercase mb-1">
                      <TrophyIcon className="w-3 h-3 text-yellow-500" />
                      <span>Podios</span>
                    </div>
                    <span className="text-lg font-mono font-bold text-white">
                      {c.victorias}
                    </span>
                  </div>

                  {/* Stat 2: Nota Promedio */}
                  <div className="bg-black/20 rounded-lg p-3 border border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-xs text-white/40 font-bold uppercase mb-1 relative z-10">
                      <StarIcon className="w-3 h-3 text-cyan-400" />
                      <span>Avg. Score</span>
                    </div>
                    <span className="text-lg font-mono font-bold text-white relative z-10">
                      {c.notaPromedio.toFixed(1)} {/* Formateamos a un decimal si es necesario */}
                    </span>
                    {/* Barra de Progreso de fondo sutil */}
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-cyan-500/50" 
                      style={{ width: `${ratingPercent}%` }} 
                    />
                  </div>

                  {/* Stat 3: Participaciones */}
                  <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/40 font-bold uppercase mb-1">
                      <MicrophoneIcon className="w-3 h-3 text-purple-400" />
                      <span>Batallas</span>
                    </div>
                    <span className="text-lg font-mono font-bold text-white">
                      {c.participaciones}
                    </span>
                  </div>

                </div>

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Botón "Ver Más" */}
      {visibleItems < stats.length && (
        <div className="flex justify-center mt-8">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onClick={handleLoadMore}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 font-bold text-sm uppercase tracking-wider hover:bg-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
          >
            <ChevronDownIcon className="w-5 h-5" />
            <span>Ver Más Competidores</span>
          </motion.button>
        </div>
      )}

    </section>
  );
}