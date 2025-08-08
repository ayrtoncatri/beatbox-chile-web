'use client';
import { motion } from 'framer-motion';
import { FaUserCircle } from 'react-icons/fa';

// Simula tus datos de competidor
const competidores = [
  {
    nombre: 'Beatmaster',
    victorias: 12,
    finales: 5,
    podios: 18,
  },
  {
    nombre: 'Vocalizer',
    victorias: 3,
    finales: 2,
    podios: 7,
  },
];

export default function EstadisticasCompetidor() {
  return (
    <section className="mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-fuchsia-300 drop-shadow-lg">
        Estadísticas de Competidores
      </h2>
      <ul className="grid sm:grid-cols-2 gap-8">
        {competidores.map((c, i) => (
          <motion.li
            key={i}
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
                       transition-all duration-400 hover:scale-[1.035] hover:border-fuchsia-300/80
                       cursor-pointer"
            style={{ perspective: 600 }}
            whileHover={{ rotateY: 4, rotateX: -4 }}
          >
            <FaUserCircle className="text-fuchsia-300 text-3xl drop-shadow-glow mr-2" />
            <div>
              <h3 className="text-2xl font-extrabold text-white drop-shadow-lg mb-1 flex items-center gap-2">
                {c.nombre}
              </h3>
              <div className="flex flex-wrap gap-6 text-fuchsia-100 font-medium">
                <span>🏆 Victorias: <span className="font-bold">{c.victorias}</span></span>
                <span>🥈 Finales: <span className="font-bold">{c.finales}</span></span>
                <span>🥉 Podios: <span className="font-bold">{c.podios}</span></span>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
