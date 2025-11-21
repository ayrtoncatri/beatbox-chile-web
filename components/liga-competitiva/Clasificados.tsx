"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { 
  TrophyIcon, 
  MapPinIcon, 
  FireIcon, 
  UserIcon 
} from "@heroicons/react/24/solid";

// Datos simulados (Mockup) - Conecta esto a tu DB luego
const clasificados = [
  { rank: 1, nombre: "Beatmaster", ciudad: "Santiago", puntos: 1250, image: "" },
  { rank: 2, nombre: "Bass Queen", ciudad: "Valparaíso", puntos: 1100, image: "" }, // Sin foto para probar fallback
  { rank: 3, nombre: "Metronome", ciudad: "Concepción", puntos: 950, image: "" },
  { rank: 4, nombre: "Kicks", ciudad: "Antofagasta", puntos: 820, image: "" },
  { rank: 5, nombre: "Snare", ciudad: "La Serena", puntos: 750, image: "" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function Clasificados() {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-4">
      
      {/* Header del Ranking */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FireIcon className="w-6 h-6 text-orange-500 animate-pulse" />
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              Temporada 2025
            </span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Ranking <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Nacional</span>
          </h2>
        </div>
        
        <div className="px-4 py-2 rounded-lg bg-blue-900/20 border border-blue-500/30 text-blue-200 text-xs font-bold uppercase">
          Top 5 Clasificados
        </div>
      </div>

      {/* Tabla de Clasificación */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex flex-col gap-3"
      >
        {clasificados.map((c) => {
          // Lógica de colores según el Rango
          const isTop1 = c.rank === 1;
          const isTop2 = c.rank === 2;
          const isTop3 = c.rank === 3;
          
          let rankColor = "text-white/50";
          let borderColor = "border-white/5";
          let bgGradient = "bg-[#0c0c12]/60";
          let trophyColor = null;

          if (isTop1) {
            rankColor = "text-yellow-400";
            borderColor = "border-yellow-500/50";
            bgGradient = "bg-gradient-to-r from-yellow-900/20 to-[#0c0c12]/80";
            trophyColor = "text-yellow-400";
          } else if (isTop2) {
            rankColor = "text-slate-300";
            borderColor = "border-slate-400/50";
            bgGradient = "bg-gradient-to-r from-slate-800/20 to-[#0c0c12]/80";
            trophyColor = "text-slate-300";
          } else if (isTop3) {
            rankColor = "text-amber-700";
            borderColor = "border-amber-700/50";
            bgGradient = "bg-gradient-to-r from-amber-900/10 to-[#0c0c12]/80";
            trophyColor = "text-amber-700";
          }

          return (
            <motion.div
              key={c.rank}
              variants={item}
              className={`relative flex items-center gap-4 p-4 rounded-xl border ${borderColor} ${bgGradient} backdrop-blur-md hover:bg-white/5 transition-all duration-300 group`}
            >
              {/* Rango Número */}
              <div className={`w-8 text-center font-black italic text-2xl ${rankColor}`}>
                #{c.rank}
              </div>

              {/* Avatar con Fallback */}
              <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-full p-[2px] bg-gradient-to-b from-white/20 to-transparent overflow-hidden">
                <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                  {c.image ? (
                    <Image 
                      src={c.image} 
                      alt={c.nombre} 
                      fill 
                      className="object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : null}
                  {/* Fallback Icon siempre renderizado detrás, visible si no hay img */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/10 -z-10">
                    <UserIcon className="w-6 h-6 text-white/30" />
                  </div>
                </div>
                {/* Corona para el Top 1 */}
                {isTop1 && (
                   <div className="absolute -top-3 -right-1 text-yellow-400 drop-shadow-lg animate-bounce">
                     <TrophyIcon className="w-6 h-6" />
                   </div>
                )}
              </div>

              {/* Info del Beatboxer */}
              <div className="flex-grow">
                <h3 className="text-lg md:text-xl font-black italic uppercase text-white tracking-tight group-hover:text-blue-400 transition-colors">
                  {c.nombre}
                </h3>
                <div className="flex items-center gap-1 text-xs md:text-sm text-white/40 font-medium">
                  <MapPinIcon className="w-3 h-3" />
                  {c.ciudad}
                </div>
              </div>

              {/* Puntos / Stats */}
              <div className="text-right min-w-[80px]">
                <span className="block text-xl font-black italic text-white leading-none">
                  {c.puntos}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                  PTS
                </span>
              </div>

              {/* Trofeo Visual para Top 3 */}
              {trophyColor && (
                <TrophyIcon className={`w-12 h-12 absolute right-20 opacity-10 ${trophyColor} pointer-events-none`} />
              )}

            </motion.div>
          );
        })}
      </motion.div>

    </section>
  );
}