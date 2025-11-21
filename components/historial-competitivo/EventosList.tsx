'use client';
import { motion, Variants } from 'framer-motion';
import { CalendarIcon, MapPinIcon, MicrophoneIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { PublicEventListData } from '@/app/actions/public-data';

interface EventosListProps {
  events: PublicEventListData;
}

// Estilos de animación para la lista
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};


export default function EventosList({ events }: EventosListProps) {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4">
      
      {/* Header de Sección */}
      <div className="flex items-center gap-3 mb-10">
        <div className="h-8 w-1 bg-gradient-to-b from-cyan-400 to-fuchsia-500 rounded-full" />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          Eventos <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">Archivados</span>
        </h2>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid md:grid-cols-2 gap-6"
      >
        
        {events.map((ev, i) => (
          // --- (5) Envolvemos cada item en un Link ---
          <Link href={`/historial-competitivo/eventos/${ev.id}`} key={ev.id} className="block group">
            <motion.div
              variants={item}
              className={`relative rounded-xl overflow-hidden
                          bg-[#0b1121]/60 backdrop-blur-md border border-white/5 
                          hover:border-fuchsia-500/50 transition-all duration-400 
                          hover:scale-[1.01] hover:shadow-[0_10px_30px_-5px_rgba(217,70,239,0.2)]
                          cursor-pointer p-0`}
            >
              
              {/* LÍNEA DE PROGRESO DE ARCHIVO (Borde Izquierdo) */}
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-fuchsia-500 to-blue-500 opacity-70 group-hover:w-2 transition-all duration-300" />

              <div className="p-6 pl-8 flex flex-col gap-2 relative z-10">
                
                {/* TÍTULO AGRESIVO */}
                <h3 className="text-xl font-black italic uppercase text-white tracking-tight group-hover:text-fuchsia-400 transition-colors leading-snug">
                  {ev.nombre}
                </h3>
                
                {/* METADATOS */}
                <div className="flex items-center gap-4 text-sm text-white/70 font-medium pt-1">
                  
                  {/* Fecha */}
                  <span className="flex items-center gap-2 text-fuchsia-300 font-mono text-xs uppercase tracking-widest">
                    <CalendarIcon className="w-4 h-4 text-fuchsia-500" />
                    {new Date(ev.fecha).toLocaleDateString('es-CL')}
                  </span>
                  
                  {/* Lugar */}
                  <span className="flex items-center gap-2 text-white/50 text-xs">
                    <MapPinIcon className="w-4 h-4 text-blue-400" />
                    {ev.venue.name}
                  </span>
                  
                </div>
                
                {/* BADGE DE CATEGORÍA (Ejemplo) */}
                <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  <MicrophoneIcon className="w-3 h-3" />
                  Final Nacional
                </span>

              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </section>
  );
}