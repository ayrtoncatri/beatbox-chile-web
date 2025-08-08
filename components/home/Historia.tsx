// /components/Historia.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const historialCampeonato = [
  {
    año: 2007,
    titulo: "Primera Edición Campeonato Nacional",
    campeon: "Gustabeat-o",
    subcampeon: "Looney",
    tagTeam: null,
    descripcion: `La primera edición del campeonato nacional, se realizó un 1 de Octubre del 2007 durante el evento Streetbox Fest en La Florida. Eran los inicios del beatbox competitivo en Chile y aquí aparecen los primeros exponentes que abrieron camino a lo que somos ahora.`,
  },
  {
    año: 2008,
    titulo: "Segunda Edición Campeonato Nacional",
    campeon: "Creabeatbox",
    subcampeon: "Migraña",
    tagTeam: null,
    descripcion: `El 31 de Julio del 2008 se realiza la segunda edición. Creabeatbox, tras coronarse campeón, catapultó su carrera musical y colaboró con grandes del Hip-Hop Nacional.`,
  },
  {
    año: 2012,
    titulo: "Tercera Edición Campeonato Nacional",
    campeon: "Mr. Androide",
    subcampeon: "Besbecko",
    tagTeam: null,
    descripcion: `El 19 de Octubre del 2012, primera vez organizado por los pilares de Beatbox Chile. Mr. Androide clasifica al Mundial y junto a Cat Negro representan a Chile en Alemania.`,
  },
  {
    año: 2015,
    titulo: "Cuarta Edición Campeonato Nacional",
    campeon: "Onetime",
    subcampeon: "Vintrex",
    tagTeam: "Spectros Family (BCJ & MC Sura)",
    descripcion: `El 5 de Diciembre en el anfiteatro El Cortijo, con jurado internacional. Onetime gana y clasifica al Mundial de Alemania 2018.`,
  },
  {
    año: 2016,
    titulo: "Quinta Edición Campeonato Nacional",
    campeon: "Ex-bitt",
    subcampeon: "Karloz",
    tagTeam: "Trakloz (Trako & Karloz)",
    descripcion: `10 de diciembre en Black Soul, Puente Alto. Ex-BiTT se consagra campeón y clasifica al Mundial de Berlín 2018.`,
  },
  {
    año: 2017,
    titulo: "Sexta Edición Campeonato Nacional",
    campeon: "Waali",
    subcampeon: "Patobeats",
    tagTeam: null,
    descripcion: `Se crea la directiva Beatbox Chile. Primera vez que un competidor de región, Waali de Antofagasta, se lleva el título.`,
  },
  {
    año: 2018,
    titulo: "Séptima Edición Campeonato Nacional",
    campeon: "Tomazacre (Masculino) / Nelbiclap (Femenino)",
    subcampeon: "Patobeats (Masculino) / Cornish (Femenino)",
    tagTeam: null,
    descripcion: `Primera edición con campeón y campeona femenina y masculina.`,
  },
  {
    año: 2019,
    titulo: "Octava Edición Campeonato Nacional",
    campeon: "Ex-BiTT (M) / Cornish (F)",
    subcampeon: "BCJ (M) / Nelbiclap (F)",
    tagTeam: "Abducted (Mr. Androide & Tomazacre)",
    descripcion: `Se consagran campeones masculinos y femeninos, y Tag Team.`,
  },
  {
    año: 2021,
    titulo: "Novena Edición Campeonato Nacional",
    campeon: "Xiphire (M)",
    subcampeon: "Onbeatz (M)",
    tagTeam: "D-Auditive (Inferno & Penta)",
    descripcion: `Última edición documentada. Nuevos campeones individuales y en Tag Team.`,
  },
];

const variants: {
    enter: (direction: number) => any;
    center: any;
    exit: (direction: number) => any;
    } = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        position: "absolute" as const,
    }),
    center: {
        x: 0,
        opacity: 1,
        position: "relative" as const,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
        position: "absolute" as const,
        transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
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
    <section className="flex flex-col items-center bg-gradient-to-br from-[#182642]/90 via-[#101e34]/90 to-[#1a2453]/80 shadow-2xl backdrop-blur-lg border border-blue-700/20 rounded-3xl px-7 py-9 max-w-xl mx-auto mt-4"
      style={{
        boxShadow: "0 4px 24px 4px rgba(40,70,180,0.25)",
        background: "linear-gradient(120deg, #151E2E 90%, #1B254B 100%)",
      }}
    >
      <div className="w-full flex justify-between items-center mb-6">
        <button
          onClick={() => change(-1)}
          className="transition shadow-lg hover:scale-110 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full p-3 hover:from-blue-700 hover:to-blue-500 focus:outline-none"
          aria-label="Anterior"
        >
          <svg width="24" height="24" fill="currentColor"><path d="M15.5 19 9.5 12l6-7"/></svg>
        </button>
        <span className="text-2xl md:text-2xl font-bold text-blue-100 text-center flex-1 px-4">
          {edicion.año} <span className="font-extrabold text-blue-300">—</span> {edicion.titulo}
        </span>
        <button
          onClick={() => change(1)}
          className="transition shadow-lg hover:scale-110 bg-gradient-to-l from-blue-600 to-blue-400 text-white rounded-full p-3 hover:from-blue-700 hover:to-blue-500 focus:outline-none"
          aria-label="Siguiente"
        >
          <svg width="24" height="24" fill="currentColor"><path d="M8.5 5l6 7-6 7"/></svg>
        </button>
      </div>
      <div className="relative w-full min-h-[200px]">
        <AnimatePresence custom={direction} mode="wait" initial={false}>
          <motion.div
            key={idx}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            <div className="text-lg">
              <p>
                <span className="font-bold text-blue-300">Campeón:</span> <span className="font-medium text-yellow-300">{edicion.campeon}</span>
              </p>
              <p>
                <span className="font-bold text-blue-300">Subcampeón:</span> <span className="font-medium text-yellow-300">{edicion.subcampeon}</span>
              </p>
              {edicion.tagTeam && (
                <p>
                  <span className="font-bold text-blue-300">Tag Team:</span>{" "}
                  <span className="font-medium">{edicion.tagTeam}</span>
                </p>
              )}
              <p className="mt-5 text-blue-100 leading-relaxed">{edicion.descripcion}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-7 text-blue-400 tracking-widest text-lg font-semibold">
        {idx + 1} <span className="opacity-50">/</span> {total}
      </div>
    </section>
  );
}