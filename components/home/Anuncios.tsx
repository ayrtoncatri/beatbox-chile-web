"use client";
import React, { useState } from 'react';
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Cpu, ArrowLeft, ArrowRight } from "lucide-react";


const INFO_GANADORES = [
  {
    id: "solo",
    categoria: "SOLO BATTLE",
    icon: <Trophy className="w-6 h-6 text-cyan-300" />,
    accent: "home-card-cyan",
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
    icon: <Users className="w-6 h-6 text-fuchsia-300" />,
    accent: "home-card-magenta",
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
    icon: <Cpu className="w-6 h-6 text-violet-300" />,
    accent: "home-card-violet",
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
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-10 h-72 w-72 bg-cyan-400/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 bg-fuchsia-500/15 blur-[110px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-stretch">
        <div className="flex items-center justify-between gap-4 lg:w-20 lg:flex-col lg:justify-between">
          <p className="home-kicker lg:hidden">Legado de la escena</p>
          <h2 className="home-title text-5xl text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] sm:text-6xl lg:hidden">
            Hall of Fame
          </h2>
          <h2 className="home-vert hidden text-7xl text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] lg:block">
            Hall of Fame
          </h2>
          <p className="hidden max-w-[9rem] text-right text-xs leading-5 text-white/55 lg:block">2025 · Campeones de la temporada</p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-6 hidden max-w-md text-sm leading-6 text-white/65 lg:block">Campeones que definieron la temporada con identidad, técnica y escenario.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INFO_GANADORES.map((cat) => {
              const currentIndex = indices[cat.id as keyof typeof indices];
              const person = cat.ganadores[currentIndex];
              const rank = String(currentIndex + 1).padStart(2, "0");

              return (
                <div key={cat.id} className={`home-card ${cat.accent} group p-4`}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cat.icon}
                      <span className="text-xs font-bold tracking-widest text-white/80 uppercase">{cat.categoria}</span>
                    </div>
                    <div className="flex gap-2">
                      <button aria-label={`Ganador anterior de ${cat.categoria}`} onClick={() => handlePrev(cat.id)} className="flex h-10 w-10 items-center justify-center border border-white/20 bg-black/30 text-white transition-colors hover:bg-white/10"><ArrowLeft size={16}/></button>
                      <button aria-label={`Siguiente ganador de ${cat.categoria}`} onClick={() => handleNext(cat.id)} className="flex h-10 w-10 items-center justify-center border border-white/20 bg-black/30 text-white transition-colors hover:bg-white/10"><ArrowRight size={16}/></button>
                    </div>
                  </div>

                  <div className="relative min-h-85 flex flex-col">
                    <span className="pointer-events-none absolute -right-1 -top-3 font-display text-7xl italic text-white/10">{rank}</span>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${cat.id}-${currentIndex}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full"
                      >
                        <div className={`relative mb-4 h-56 w-full overflow-hidden border ${person.color} ${person.glow}`}>
                          <Image
                            src={person.img}
                            alt={person.nombre}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                        </div>

                        <span className="text-[10px] font-black tracking-[0.28em] text-fuchsia-300 uppercase">
                          {person.puesto}
                        </span>
                        <h3 className="home-title mt-1 text-4xl text-white">
                          {person.nombre}
                        </h3>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">
                          {person.bio}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="mt-5 flex justify-center gap-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-cyan-300' : 'w-3 bg-white/20'}`} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
