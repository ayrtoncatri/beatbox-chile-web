"use client";
import { useState } from "react";
// 1. IMPORTAMOS 'Variants'
import { motion, AnimatePresence, Variants } from "framer-motion"; 
import { ChevronLeftIcon, ChevronRightIcon, TrophyIcon } from "@heroicons/react/24/solid";

const historialCampeonato = [
  {
    año: 2007,
    titulo: "Primera Edición",
    campeon: "Gustabeat-o",
    subcampeon: "Looney",
    tagTeam: null,
    descripcion: `La primera edición del campeonato nacional, se realizó un 1 de Octubre del 2007 durante el evento Streetbox Fest en La Florida. Eran los inicios del beatbox competitivo en Chile y aquí aparecen los primeros exponentes que abrieron camino a lo que somos ahora.`,
  },
  {
    año: 2008,
    titulo: "Segunda Edición",
    campeon: "Creabeatbox",
    subcampeon: "Migraña",
    tagTeam: null,
    descripcion: `El 31 de Julio del 2008 se realiza la segunda edición. Creabeatbox, tras coronarse campeón, catapultó su carrera musical y colaboró con grandes del Hip-Hop Nacional.`,
  },
  {
    año: 2012,
    titulo: "Tercera Edición",
    campeon: "Mr. Androide",
    subcampeon: "Besbecko",
    tagTeam: null,
    descripcion: `El 19 de Octubre del 2012, primera vez organizado por los pilares de Beatbox Chile. Mr. Androide clasifica al Mundial y junto a Cat Negro representan a Chile en Alemania.`,
  },
  {
    año: 2015,
    titulo: "Cuarta Edición",
    campeon: "Onetime",
    subcampeon: "Vintrex",
    tagTeam: "Spectros Family (BCJ & MC Sura)",
    descripcion: `El 5 de Diciembre en el anfiteatro El Cortijo, con jurado internacional. Onetime gana y clasifica al Mundial de Alemania 2018.`,
  },
  {
    año: 2016,
    titulo: "Quinta Edición",
    campeon: "Ex-bitt",
    subcampeon: "Karloz",
    tagTeam: "Trakloz (Trako & Karloz)",
    descripcion: `10 de diciembre en Black Soul, Puente Alto. Ex-BiTT se consagra campeón y clasifica al Mundial de Berlín 2018.`,
  },
  {
    año: 2017,
    titulo: "Sexta Edición",
    campeon: "Waali",
    subcampeon: "Patobeats",
    tagTeam: null,
    descripcion: `Se crea la directiva Beatbox Chile. Primera vez que un competidor de región, Waali de Antofagasta, se lleva el título.`,
  },
  {
    año: 2018,
    titulo: "Séptima Edición",
    campeon: "Tomazacre (Masculino) / Nelbiclap (Femenino)",
    subcampeon: "Patobeats (Masculino) / Cornish (Femenino)",
    tagTeam: null,
    descripcion: `Primera edición con campeón y campeona femenina y masculina.`,
  },
  {
    año: 2019,
    titulo: "Octava Edición",
    campeon: "Ex-BiTT (M) / Cornish (F)",
    subcampeon: "BCJ (M) / Nelbiclap (F)",
    tagTeam: "Abducted (Mr. Androide & Tomazacre)",
    descripcion: `Se consagran campeones masculinos y femeninos, y Tag Team.`,
  },
  {
    año: 2021,
    titulo: "Novena Edición",
    campeon: "Xiphire (M)",
    subcampeon: "Onbeatz (M)",
    tagTeam: "D-Auditive (Inferno & Penta)",
    descripcion: `Última edición documentada. Nuevos campeones individuales y en Tag Team.`,
  },
];

// 2. TIPAMOS LA CONSTANTE COMO 'Variants'
const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    // TypeScript a veces necesita ayuda con los arrays de easing, pero con el tipo Variants debería bastar.
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }, 
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Historia() {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = historialCampeonato.length;

  const change = (dir: number) => {
    setDirection(dir);
    setIdx((prev) => (prev + dir + total) % total);
  };

  const edicion = historialCampeonato[idx];

  return (
    <section className="w-full max-w-3xl mx-auto py-12 px-4">
      
      {/* HEADER: Título de la Sección */}
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
            El Legado <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Histórico</span>
        </h2>
        <div className="h-1 w-24 bg-blue-600 mx-auto mt-2 rounded-full" />
      </div>

      {/* TARJETA PRINCIPAL */}
      <div className="relative bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl group">
        
        {/* Efecto de borde brillante (Glow) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />

        <div className="relative bg-[#0c0c12] p-6 md:p-10 rounded-3xl h-full flex flex-col justify-between min-h-[400px]">
            
            {/* NAVEGACIÓN SUPERIOR */}
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <button onClick={() => change(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hover:-translate-x-1">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                
                <div className="text-center">
                    <span className="block text-5xl font-black text-white/10 absolute left-1/2 -translate-x-1/2 -top-2 select-none pointer-events-none">
                        {edicion.año}
                    </span>
                    <h3 className="relative text-2xl font-bold text-white uppercase tracking-wide">
                        {edicion.año}
                    </h3>
                    <span className="text-xs text-blue-400 font-bold tracking-widest uppercase">
                        {edicion.titulo}
                    </span>
                </div>

                <button onClick={() => change(1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hover:translate-x-1">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>

            {/* CONTENIDO ANIMADO */}
            <div className="relative flex-1 overflow-hidden">
                <AnimatePresence custom={direction} mode="wait" initial={false}>
                    <motion.div
                        key={idx}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="w-full h-full flex flex-col justify-center"
                    >
                        <div className="space-y-6 text-center">
                            
                            {/* CAMPEÓN */}
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">
                                    <TrophyIcon className="w-3 h-3" /> Campeón
                                </div>
                                <h4 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                                    {edicion.campeon}
                                </h4>
                            </div>

                            {/* SUBCAMPEÓN & TAG TEAM */}
                            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 text-sm">
                                <div>
                                    <span className="text-gray-500 font-bold uppercase text-xs block mb-1">Subcampeón</span>
                                    <span className="text-gray-300 font-semibold text-lg">{edicion.subcampeon}</span>
                                </div>
                                {edicion.tagTeam && (
                                    <div>
                                        <span className="text-gray-500 font-bold uppercase text-xs block mb-1">Tag Team</span>
                                        <span className="text-blue-300 font-semibold text-lg">{edicion.tagTeam}</span>
                                    </div>
                                )}
                            </div>

                            {/* DESCRIPCIÓN */}
                            <div className="pt-6 border-t border-white/5">
                                <p className="text-gray-400 leading-relaxed text-sm md:text-base max-w-xl mx-auto italic">
                                    {edicion.descripcion}
                                </p>
                            </div>

                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* PAGINACIÓN (DOTS) */}
            <div className="flex justify-center gap-2 mt-8">
                {historialCampeonato.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-blue-500' : 'w-1.5 bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
      </div>

    </section>
  );
}