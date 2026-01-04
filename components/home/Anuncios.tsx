"use client"; // Necesario para Framer Motion y estados
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Cpu, ArrowLeft, ArrowRight } from "lucide-react";


const INFO_GANADORES = [
  {
    id: "solo",
    categoria: "SOLO BATTLE",
    icon: <Trophy className="w-6 h-6 text-yellow-400" />,
    color: "from-yellow-600/20",
    ganadores: [
      { 
        puesto: "🥇 CAMPEÓN NACIONAL", 
        nombre: "XIPHIRE", 
        img: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1767553848/xiphire-campeon-2025-solo_pyfsgn.webp", 
        color: "border-yellow-500/50",
        glow: "shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]",
        bio: "BICAMPEÓN NACIONAL. Consistencia y madurez artística que marcaron época."
      },
      { 
        puesto: "🥈 SUBCAMPEÓN", 
        nombre: "INFERNO", 
        img: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1767553993/inferno-campeon-2025_we0tc9.webp", 
        color: "border-slate-300/50",
        glow: "shadow-[0_0_30px_-5px_rgba(203,213,225,0.2)]",
        bio: "Energía desbordante y presencia escénica que encendió al público."
      },
      { 
        puesto: "🥉 TERCER LUGAR", 
        nombre: "EX-BITT", 
        img: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1767554101/exbitt-tercer-lugar_p6bnpy.webp", 
        color: "border-orange-400/50",
        glow: "shadow-[0_0_30px_-5px_rgba(251,146,60,0.2)]",
        bio: "Experiencia y técnica contundente. Pieza clave de la escena."
      }
    ]
  },
  {
    id: "tag",
    categoria: "TAG TEAM",
    icon: <Users className="w-6 h-6 text-blue-400" />,
    color: "from-blue-600/20",
    ganadores: [
      { 
        puesto: "🥇 CAMPEONES ABSOLUTOS", 
        nombre: "PERPETUAL INMORTALEM", 
        img: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1767554173/pi-tag-team_hqncc3.webp", 
        color: "border-blue-500/50",
        glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
        bio: "Blvckned + Ex-BiTT. Precisión y presencia de otro planeta."
      },
      { 
        puesto: "🥈 SUBCAMPEONES", 
        nombre: "1+1", 
        img: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1767554221/subcampeom-tag-team_oarnv7.webp", 
        color: "border-slate-300/50",
        glow: "shadow-[0_0_30px_-5px_rgba(203,213,225,0.2)]",
        bio: "Tonio + Maharate. Groove y química histórica en el escenario."
      },
      { 
        puesto: "🥉 TERCER LUGAR", 
        nombre: "D-AUDITIVE", 
        img: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1767554276/tercerlugar-tagteam_nnj8ua.webp", 
        color: "border-orange-400/50",
        glow: "shadow-[0_0_30px_-5px_rgba(251,146,60,0.2)]",
        bio: "Inferno + Penta. Evolución constante y carácter imparable."
      }
    ]
  },
  {
    id: "loop",
    categoria: "LOOPSTATION",
    icon: <Cpu className="w-6 h-6 text-purple-400" />,
    color: "from-purple-600/20",
    ganadores: [
      { 
        puesto: "🥇 CAMPEÓN NACIONAL", 
        nombre: "OMEGA", 
        img: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1767554316/campeon-loopstation_nkxgj8.webp", 
        color: "border-purple-500/50",
        glow: "shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]",
        bio: "Arquitecto del sonido y dominio total de la máquina."
      },
      { 
        puesto: "🥈 SUBCAMPEÓN", 
        nombre: "TEKS", 
        img: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1767554350/subcampeon-loop_et1oxw.webp", 
        color: "border-slate-300/50",
        glow: "shadow-[0_0_30px_-5px_rgba(203,213,225,0.2)]",
        bio: "Potencia técnica que empujó los límites de la categoría."
      },
      { 
        puesto: "🥉 TERCER LUGAR", 
        nombre: "EPIC WINE", 
        img: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1767554390/tercerlugar-loop_rfejs5.webp", 
        color: "border-orange-400/50",
        glow: "shadow-[0_0_30px_-5px_rgba(251,146,60,0.2)]",
        bio: "Identidad y sonido propio que conectó con todo el público."
      }
    ]
  }
];

export default function Anuncios() {
  const [indices, setIndices] = useState({ solo: 0, tag: 0, loop: 0 });

  const handleNext = (catId: string) => {
    setIndices(prev => ({ ...prev, [catId]: (prev[catId as keyof typeof prev] + 1) % 3 }));
  };

  const handlePrev = (catId: string) => {
    setIndices(prev => ({ ...prev, [catId]: (prev[catId as keyof typeof prev] - 1 + 3) % 3 }));
  };

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="h-[2px] w-12 bg-red-600"></div>
        <h2 className="text-3xl font-black text-white italic tracking-widest uppercase">
          Hall of Fame <span className="text-red-600">2025</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {INFO_GANADORES.map((cat) => {
          const currentIndex = indices[cat.id as keyof typeof indices];
          const person = cat.ganadores[currentIndex];

          return (
            <div key={cat.id} className="group relative">
              {/* Card Container */}
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-b ${cat.color} to-[#0a0a0f] border border-white/10 p-6 transition-all duration-500 hover:border-white/20`}>
                
                {/* Header Categoria */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    {cat.icon}
                    <span className="text-xs font-bold tracking-widest text-white/70 uppercase">{cat.categoria}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handlePrev(cat.id)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><ArrowLeft size={16}/></button>
                    <button onClick={() => handleNext(cat.id)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><ArrowRight size={16}/></button>
                  </div>
                </div>

                {/* Content with Animation */}
                <div className="min-h-[400px] flex flex-col items-center text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${cat.id}-${currentIndex}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full flex flex-col items-center"
                    >
                      {/* Avatar con Estilo Dinámico */}
                      <div className={`relative w-48 h-48 mb-6 rounded-2xl border-2 ${person.color} ${person.glow} overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500`}>
                        <img 
                          src={person.img} 
                          alt={person.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <span className="text-[10px] font-black text-red-500 tracking-[0.3em] uppercase mb-2">
                        {person.puesto}
                      </span>
                      <h3 className="text-2xl font-black text-white italic mb-4 leading-tight">
                        {person.nombre}
                      </h3>
                      <p className="text-sm text-gray-400 font-medium leading-relaxed px-4">
                        {person.bio}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Paginación visual (puntos) */}
                <div className="flex justify-center gap-2 mt-6">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-red-600' : 'w-2 bg-white/20'}`} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}