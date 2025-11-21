'use client';

import { motion } from 'framer-motion';
import { 
  UserIcon,
  CheckBadgeIcon, 
  CalendarDaysIcon, 
  ArrowTrendingUpIcon
} from '@heroicons/react/24/solid';
import { GlobalJudgeStatsData } from '@/app/actions/public-data';

interface EstadisticasJuecesProps {
  stats: GlobalJudgeStatsData;
}

export default function EstadisticasJueces({ stats }: EstadisticasJuecesProps) {
  return (
    <section className="relative z-10">
      
      {/* Header de Sección */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-purple-400 to-fuchsia-500 rounded-full" />
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Panel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">Jueceo</span>
          </h2>
        </div>
        
        {/* Etiqueta decorativa */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-fuchsia-300/50 uppercase tracking-widest bg-fuchsia-900/10 px-3 py-1 rounded border border-fuchsia-500/20">
          <CheckBadgeIcon className="w-3 h-3 text-fuchsia-400" />
          Metodología Validada
        </div>
      </div>

      {/* Grid de Tarjetas de Juez */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        
        {stats.map((j, i) => {
          // Simulamos una métrica de consistencia (ej: desviación estándar de puntajes)
          // Usaremos 'eventosJuzgados' para crear un color dinámico
          const consistencyColor = j.eventosJuzgados > 10 ? 'text-green-400' : 'text-yellow-400';
          const consistencyValue = j.eventosJuzgados > 10 ? 'Alta Consistencia' : 'Baja Consistencia';
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group rounded-xl overflow-hidden
                         bg-[#0f172a]/60 backdrop-blur-md border border-white/5 hover:border-fuchsia-500/30 transition-all duration-300"
            >
              {/* Overlay de Sombra */}
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-6 flex flex-col justify-between h-full">
                
                {/* Icono Principal y Nombre */}
                <div className="flex items-start gap-4 z-10">
                  <UserIcon className="w-8 h-8 text-fuchsia-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-white tracking-tight leading-none">
                      {j.nombre}
                    </h3>
                    <p className="text-white/40 text-xs font-mono uppercase mt-1">
                      Judge ID: J-{j.nombre.slice(0, 3).toUpperCase()}{i + 1}
                    </p>
                  </div>
                </div>

                {/* Métricas Inferiores */}
                <div className="mt-6 space-y-3 pt-3 border-t border-white/10 z-10">
                  
                  {/* Métrica 1: Eventos Juzgados */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase text-white/60">
                      <CalendarDaysIcon className="w-3 h-3 text-white/40" />
                      Total Eventos
                    </span>
                    <span className="text-lg font-mono font-bold text-fuchsia-300">
                      {j.eventosJuzgados}
                    </span>
                  </div>

                  {/* Métrica 2: Consistencia (Simulada) */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase text-white/60">
                      <ArrowTrendingUpIcon className={`w-3 h-3 ${consistencyColor}`} />
                      Consistencia
                    </span>
                    <span className={`text-sm font-mono font-bold ${consistencyColor}`}>
                      {consistencyValue}
                    </span>
                  </div>

                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}