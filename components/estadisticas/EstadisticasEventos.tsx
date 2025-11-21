'use client';

import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  UsersIcon, 
  TrophyIcon, 
  CalendarDaysIcon 
} from '@heroicons/react/24/solid';
import { GlobalEventStatsData } from '@/app/actions/public-data';

interface EstadisticasEventosProps {
  stats: GlobalEventStatsData;
}

export default function EstadisticasEventos({ stats }: EstadisticasEventosProps) {
  
  const statsItems = [
    { 
      label: 'Eventos Totales', 
      value: stats.totalEventos, 
      icon: <CalendarDaysIcon className="w-6 h-6 text-cyan-400" />,
      bg: "from-cyan-500/10 to-blue-500/10",
      border: "group-hover:border-cyan-500/50"
    },
    { 
      label: 'Comunidad Activa', 
      value: stats.totalParticipantes, 
      icon: <UsersIcon className="w-6 h-6 text-indigo-400" />,
      bg: "from-indigo-500/10 to-purple-500/10",
      border: "group-hover:border-indigo-500/50"
    },
    { 
      label: 'Campeón Vigente', 
      value: stats.ultimoGanadorCN || "N/A", 
      icon: <TrophyIcon className="w-6 h-6 text-yellow-400" />,
      bg: "from-yellow-500/10 to-orange-500/10",
      border: "group-hover:border-yellow-500/50"
    },
  ];

  return (
    <section className="relative z-10">
      
      {/* Header de Sección */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full" />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          Métricas <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Globales</span>
        </h2>
      </div>

      {/* Grid de KPIs */}
      <div className="grid md:grid-cols-3 gap-6">
        {statsItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            className={`group relative overflow-hidden rounded-xl bg-[#0f172a]/60 backdrop-blur-md border border-white/5 ${item.border} transition-all duration-300`}
          >
            {/* Fondo Gradiente Sutil */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Efecto Scanline (Línea que baja) */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-full group-hover:translate-y-[200%] transition-transform duration-1000 ease-in-out" />

            <div className="relative p-6 flex items-start justify-between">
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">
                  {item.label}
                </p>
                <h3 className={`font-mono font-black text-white tracking-tight ${
                  typeof item.value === 'string' && item.value.length > 10 ? 'text-2xl' : 'text-4xl'
                }`}>
                  {item.value}
                </h3>
              </div>
              
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
            </div>

            {/* Decoración Tech en esquinas */}
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-white/10 rounded-tl-lg" />
            <div className="absolute top-0 left-0 w-2 h-2 bg-white/10 rounded-br-lg" />

          </motion.div>
        ))}
      </div>
    </section>
  );
}