'use client';
import { motion } from 'framer-motion';
// --- (1) Importamos los íconos necesarios ---
import { FaChartBar, FaTrophy, FaUsers, FaBuilding } from 'react-icons/fa';
// --- (2) Importamos el TIPO de dato desde la Fase 5 ---
import { GlobalEventStatsData } from '@/app/actions/public-data';

// --- (3) El componente ahora acepta 'props' ---
interface EstadisticasEventosProps {
  stats: GlobalEventStatsData;
}

export default function EstadisticasEventos({ stats }: EstadisticasEventosProps) {
  
  // --- (4) Mapeamos los datos reales a un array para la UI ---
  const statsItems = [
    { label: 'Eventos Totales', value: stats.totalEventos, icon: <FaChartBar /> },
    { label: 'Participantes Únicos', value: stats.totalParticipantes, icon: <FaUsers /> },
    { label: 'Último Ganador CN', value: stats.ultimoGanadorCN, icon: <FaTrophy /> },
  ];

  return (
    <section className="mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-fuchsia-300 drop-shadow-lg">
        Estadísticas de Eventos
      </h2>
      {/* --- (5) Ajustamos el grid a 3 columnas --- */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* --- (6) Mapeamos los datos reales --- */}
        {statsItems.map((item, i) => (
          <motion.div
            key={i}
            // (Tus animaciones y estilos de Tailwind se mantienen)
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              type: 'spring',
              stiffness: 70,
              damping: 18,
              delay: i * 0.13,
            }}
            className="relative group rounded-2xl overflow-hidden
                        bg-gradient-to-br from-purple-900/70 via-violet-800/60 to-fuchsia-400/20
                        backdrop-blur-lg border border-fuchsia-400/20 shadow-2xl
                        p-7 flex flex-col gap-3"
            style={{ perspective: 600 }}
          >
            <div className="flex items-center gap-3 z-10">
              <span className="text-fuchsia-300 text-2xl drop-shadow-glow">{item.icon}</span>
              <h3 className="text-lg font-bold text-white drop-shadow-lg tracking-tight">
                {item.label}
              </h3>
            </div>
            {/* --- (7) Estilo dinámico para texto largo (nombre del ganador) --- */}
            <p className={`text-fuchsia-100 font-extrabold mt-2 ${
              typeof item.value === 'string' && item.value.length > 10 ? 'text-3xl' : 'text-4xl'
            }`}>
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}