'use client';
import { motion } from 'framer-motion';
// --- (1) Importamos los íconos necesarios ---
import { FaUserCircle, FaTrophy, FaStar, FaMicrophoneAlt } from 'react-icons/fa';
// --- (2) Importamos el TIPO de dato desde la Fase 5 ---
import { GlobalCompetitorStatsData } from '@/app/actions/public-data';

// --- (3) El componente ahora acepta 'props' ---
interface EstadisticasCompetidorProps {
  stats: GlobalCompetitorStatsData;
}

export default function EstadisticasCompetidor({ stats }: EstadisticasCompetidorProps) {
  return (
    <section className="mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-fuchsia-300 drop-shadow-lg">
        Ranking de Competidores
      </h2>
      {/* --- (4) Ajustamos el grid a 3 columnas para el ranking --- */}
      <ul className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- (5) Mapeamos los datos reales del ranking --- */}
        {stats.map((c, i) => (
          <motion.li
            key={i}
            // (Tus animaciones y estilos de Tailwind se mantienen)
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              type: 'spring',
              stiffness: 60,
              damping: 15,
              delay: i * 0.1,
            }}
            className="relative group rounded-2xl overflow-hidden 
                       bg-gradient-to-br from-purple-900/70 via-violet-800/60 to-fuchsia-400/20
                       backdrop-blur-lg border border-fuchsia-400/20 shadow-2xl
                       hover:shadow-fuchsia-400/40 p-7 flex items-center gap-4
                       transition-all duration-400 hover:scale-[1.035] hover:border-fuchsia-300/80"
            style={{ perspective: 600 }}
            whileHover={{ rotateY: 4, rotateX: -4 }}
          >
            <FaUserCircle className="text-fuchsia-300 text-4xl drop-shadow-glow mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-extrabold text-white drop-shadow-lg mb-2 flex items-center gap-2">
                {c.nombre}
              </h3>
              {/* --- (6) Mostramos las estadísticas reales --- */}
              <div className="flex flex-col gap-1 text-fuchsia-100 font-medium">
                <span className="flex items-center gap-2">
                  <FaTrophy className="text-yellow-400"/> Clasif. (Top 3): <span className="font-bold">{c.victorias}</span>
                </span>
                <span className="flex items-center gap-2">
                  <FaStar className="text-yellow-400"/> Nota Prom.: <span className="font-bold">{c.notaPromedio}</span>
                </span>
                <span className="flex items-center gap-2">
                  <FaMicrophoneAlt /> Participaciones: <span className="font-bold">{c.participaciones}</span>
                </span>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}