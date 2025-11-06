'use client';
import { motion } from 'framer-motion';
// --- (1) Importamos los íconos necesarios ---
import { FaGavel } from 'react-icons/fa';
// --- (2) Importamos el TIPO de dato desde la Fase 5 ---
import { GlobalJudgeStatsData } from '@/app/actions/public-data';

// --- (3) El componente acepta 'props' ---
interface EstadisticasJuecesProps {
  stats: GlobalJudgeStatsData;
}

export default function EstadisticasJueces({ stats }: EstadisticasJuecesProps) {
  return (
    <section className="mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-fuchsia-300 drop-shadow-lg">
        Ranking de Jueces
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* --- (4) Mapeamos los datos reales del ranking --- */}
        {stats.map((j, i) => (
          <motion.div
            key={i}
            // (Usamos las mismas animaciones y estilos de Tailwind)
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
              <FaGavel className="text-fuchsia-300 text-2xl drop-shadow-glow" />
              <h3 className="text-xl font-bold text-white drop-shadow-lg tracking-tight">
                {j.nombre}
              </h3>
            </div>
            <p className="text-fuchsia-100 font-medium mt-2">
              <span className="text-4xl font-extrabold">{j.eventosJuzgados}</span> Asignaciones
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}