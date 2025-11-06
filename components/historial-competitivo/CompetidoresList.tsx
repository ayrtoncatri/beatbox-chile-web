'use client';
import { motion } from 'framer-motion';
import { FaTrophy } from 'react-icons/fa';
// --- (1) Importamos Link de Next.js ---
import Link from 'next/link';
// --- (2) Importamos el TIPO de dato desde la Fase 5 ---
import { PublicCompetitorListData } from '@/app/actions/public-data';

// --- (3) El componente ahora acepta 'props' ---
interface CompetidoresListProps {
  competitors: PublicCompetitorListData;
}

export default function CompetidoresList({ competitors }: CompetidoresListProps) {
  return (
    <section className="mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-cyan-300 drop-shadow-lg">
        Competidores Destacados
      </h2>
      <ul className="grid sm:grid-cols-2 gap-8">

        {/* --- (4) Mapeamos los 'props' en lugar de datos hardcodeados --- */}
        {competitors.map((c, i) => (
          // --- (5) Envolvemos cada item en un Link ---
          <Link href={`/historial-competitivo/competidores/${c.id}`} key={c.id}>
            <motion.li
              // (Toda tu animación de framer-motion y estilos se mantienen intactos)
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
                         bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-cyan-400/20
                         backdrop-blur-lg border border-blue-400/20 shadow-2xl
                         hover:shadow-cyan-400/40 p-7 flex items-center gap-4
                         transition-all duration-400 hover:scale-[1.035] hover:border-cyan-300/80
                         cursor-pointer"
              style={{ perspective: 600 }}
              whileHover={{ rotateY: 4, rotateX: -4 }}
            >
              {/* --- (6) Usamos datos reales --- */}
              {c.destacado && (
                <FaTrophy className="text-yellow-400 drop-shadow-glow animate-bounce mr-2 text-2xl" title="Ganador" />
              )}
              <div>
                <h3 className="text-2xl font-extrabold text-white drop-shadow-lg mb-1 flex items-center gap-2">
                  {c.nombre}
                </h3>
                <p className="text-blue-100 font-medium drop-shadow">{c.logros}</p>
              </div>
            </motion.li>
          </Link>
        ))}
      </ul>
    </section>
  );
}