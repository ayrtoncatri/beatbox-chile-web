'use client';
import { motion, Variants } from 'framer-motion';
import { UserCircleIcon, TrophyIcon, StarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { PublicCompetitorListData } from '@/app/actions/public-data';

interface CompetidoresListProps {
  competitors: PublicCompetitorListData;
}

// Tipado de animaciones (fix del error anterior)
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: 'spring', stiffness: 60, damping: 15 } 
  }
};


export default function CompetidoresList({ competitors }: CompetidoresListProps) {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4">
      
      {/* Header de Sección */}
      <div className="flex items-center gap-3 mb-10">
        <div className="h-8 w-1 bg-gradient-to-b from-fuchsia-400 to-blue-500 rounded-full" />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          Competidores <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">Destacados</span>
        </h2>
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {competitors.map((c, i) => (
          <Link 
            href={`/historial-competitivo/competidores/${c.id}`} 
            key={c.id} 
            className="block group"
          >
            <motion.li
              variants={itemVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} // Retraso de entrada escalonado
              className="relative group rounded-xl overflow-hidden
                         bg-[#0b1121]/60 backdrop-blur-md border border-white/5 
                         hover:border-fuchsia-500/50 hover:bg-fuchsia-900/10 transition-all duration-300
                         cursor-pointer p-0"
            >
              {/* Contenedor Principal */}
              <div className="p-5 flex items-center gap-4 relative z-10">
                
                {/* Avatar/Placeholder */}
                <div className={`flex-shrink-0 relative w-14 h-14 rounded-full flex items-center justify-center bg-white/10 ${
                  c.destacado ? 'border border-yellow-400/50 shadow-lg shadow-yellow-500/20' : ''
                }`}>
                  <UserCircleIcon className="w-10 h-10 text-white/50 group-hover:text-cyan-400 transition-colors" />
                  
                  {/* Badge de Destacado/Trophy */}
                  {c.destacado && (
                    <TrophyIcon className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 drop-shadow-lg animate-bounce" title="Ganador Histórico" />
                  )}
                </div>

                {/* Info del Competidor */}
                <div className="flex-grow">
                  <h3 className="text-xl font-black italic uppercase text-white tracking-tight leading-snug group-hover:text-fuchsia-400 transition-colors">
                    {c.nombre}
                  </h3>
                  {/* Logros o Tagline */}
                  <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
                    {c.logros}
                    {c.destacado && (
                      <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">
                        <StarIcon className="w-3 h-3 inline-block mr-1" /> LEGEND
                      </span>
                    )}
                  </p>
                </div>

              </div>
              
              {/* Borde Inferior Estilizado */}
              <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/50 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${c.destacado ? 'opacity-100' : ''}`} />
            </motion.li>
          </Link>
        ))}
      </ul>
    </section>
  );
}