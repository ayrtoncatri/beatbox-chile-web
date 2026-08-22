"use client";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion"; 
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  TrophyIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  CpuChipIcon
} from "@heroicons/react/24/solid";

const historialCampeonato = [
  {
    año: 2007,
    titulo: "Primera Edición",
    campeon: "Gustabeat-o",
    subcampeon: "Looney",
    tagTeam: null,
    color: "from-cyan-500/20",
    descripcion: `La primera edición del campeonato nacional, se realizó un 1 de Octubre del 2007 durante el evento Streetbox Fest en La Florida. Eran los inicios del beatbox competitivo en Chile y aquí aparecen los primeros exponentes que abrieron camino a lo que somos ahora.`,
  },
  {
    año: 2008,
    titulo: "Segunda Edición",
    campeon: "Creabeatbox",
    subcampeon: "Migraña",
    tagTeam: null,
    color: "from-fuchsia-500/20",
    descripcion: `El 31 de Julio del 2008 se realiza la segunda edición. Creabeatbox, tras coronarse campeón, catapultó su carrera musical y colaboró con grandes del Hip-Hop Nacional.`,
  },
  {
    año: 2012,
    titulo: "Tercera Edición",
    campeon: "Mr. Androide",
    subcampeon: "Besbecko",
    tagTeam: null,
    color: "from-violet-500/20",
    descripcion: `El 19 de Octubre del 2012, primera vez organizado por los pilares de Beatbox Chile. Mr. Androide clasifica al Mundial y junto a Cat Negro representan a Chile en Alemania.`,
  },
  {
    año: 2015,
    titulo: "Cuarta Edición",
    campeon: "Onetime",
    subcampeon: "Vintrex",
    tagTeam: "Spectros Family (BCJ & MC Sura)",
    color: "from-cyan-500/20",
    descripcion: `El 5 de Diciembre en el anfiteatro El Cortijo, con jurado internacional. Onetime gana y clasifica al Mundial de Alemania 2018.`,
  },
  {
    año: 2016,
    titulo: "Quinta Edición",
    campeon: "Ex-bitt",
    subcampeon: "Karloz",
    tagTeam: "Trakloz (Trako & Karloz)",
    color: "from-fuchsia-500/20",
    descripcion: `10 de diciembre en Black Soul, Puente Alto. Ex-BiTT se consagra campeón y clasifica al Mundial de Berlín 2018.`,
  },
  {
    año: 2017,
    titulo: "Sexta Edición",
    campeon: "Waali",
    subcampeon: "Patobeats",
    tagTeam: null,
    color: "from-cyan-500/20",
    descripcion: `Se crea la directiva Beatbox Chile. Primera vez que un competidor de región, Waali de Antofagasta, se lleva el título.`,
  },
  {
    año: 2018,
    titulo: "Séptima Edición",
    campeon: "Tomazacre (M) / Nelbiclap (F)",
    subcampeon: "Patobeats (M) / Cornish (F)",
    tagTeam: null,
    color: "from-pink-500/20",
    descripcion: `Primera edición con campeón y campeona femenina y masculina. Un hito de inclusión en la escena nacional.`,
  },
  {
    año: 2019,
    titulo: "Octava Edición",
    campeon: "Ex-BiTT (M) / Cornish (F)",
    subcampeon: "BCJ (M) / Nelbiclap (F)",
    tagTeam: "Abducted (Mr. Androide & Tomazacre)",
    color: "from-orange-500/20",
    descripcion: `Se consagran campeones masculinos y femeninos, y Tag Team en una de las ediciones más reñidas hasta la fecha.`,
  },
  {
    año: 2021,
    titulo: "Novena Edición",
    campeon: "Xiphire (M)",
    subcampeon: "Onbeatz (M)",
    tagTeam: "D-Auditive (Inferno & Penta)",
    color: "from-indigo-500/20",
    descripcion: `Nuevos campeones individuales y en Tag Team demuestran el relevo generacional de la disciplina en Chile.`,
  },
  {
    año: 2025,
    titulo: "Séptima Edición (Actual)",
    color: "from-fuchsia-600/20",
    esMulticategoria: true,
    categorias: [
      {
        nombre: "SOLO BATTLE",
        icono: <TrophyIcon className="w-4 h-4 text-cyan-300" />,
        campeon: "Xiphire",
        subcampeon: "Inferno",
        tercero: "Ex-BiTT",
        bio: "Xiphire alcanza el BICAMPEONATO. Consistencia y madurez artística que reafirma su nombre en la historia."
      },
      {
        nombre: "TAG TEAM",
        icono: <UserGroupIcon className="w-4 h-4 text-fuchsia-300" />,
        campeon: "Perpetual Inmortalem",
        subcampeon: "1+1",
        tercero: "D-Auditive",
        bio: "Blvckned + Ex-BiTT dominaron con una propuesta sólida y agresiva."
      },
      {
        nombre: "LOOPSTATION",
        icono: <CpuChipIcon className="w-4 h-4 text-violet-300" />,
        campeon: "Omega",
        subcampeon: "Teks",
        tercero: "Epic Wine",
        bio: "Arquitecto del sonido y dominio total de la máquina, marcando un antes y un después."
      }
    ],
    descripcion: `La 7ª Edición consolidó el nivel más alto visto en Chile, con una producción de primer nivel y la consagración de leyendas y nuevos talentos en tres categorías oficiales.`
  }
];

const variants: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0, filter: "blur(10px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } },
  exit: (direction: number) => ({ x: direction > 0 ? -50 : 50, opacity: 0, filter: "blur(10px)", transition: { duration: 0.3, ease: "easeIn" } }),
};

export default function Historia() {
  const [idx, setIdx] = useState(historialCampeonato.length - 1);
  const [direction, setDirection] = useState(0);
  const total = historialCampeonato.length;

  const change = (dir: number) => {
    setDirection(dir);
    setIdx((prev) => (prev + dir + total) % total);
  };

  const edicion = historialCampeonato[idx];

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-20">
      <div className={`absolute top-1/2 left-1/2 h-[600px] w-full -translate-x-1/2 -translate-y-1/2 bg-linear-to-r ${edicion.color} to-transparent opacity-25 blur-[120px] transition-all duration-1000`} />

      <div className="relative z-10 mb-10">
        <p className="home-kicker">Archivo competitivo</p>
        <h2 className="home-title mt-2 text-5xl text-white md:text-7xl">
          El legado <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-fuchsia-300 to-violet-400">histórico</span>
        </h2>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex gap-2 overflow-x-auto pb-4 lg:col-span-2 lg:flex-col lg:overflow-x-visible lg:pb-0">
          {historialCampeonato.map((item, i) => (
            <button
              key={item.año}
              onClick={() => { setDirection(i > idx ? 1 : -1); setIdx(i); }}
              aria-current={i === idx}
              className={`flex min-h-11 items-center gap-4 border px-3 py-2.5 transition-all ${
                i === idx
                  ? "border-cyan-300/60 bg-cyan-300/10 text-white shadow-[0_0_16px_rgba(34,211,238,0.2)]"
                  : "border-white/10 text-white/45 hover:border-fuchsia-300/40 hover:text-white"
              }`}
            >
              <span className={`text-xl font-black italic ${i === idx ? "text-cyan-200" : ""}`}>{item.año}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-10">
          <div className="home-card home-card-violet min-h-[550px] p-8 md:p-12">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div key={idx} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-cyan-300" />
                    <span className="text-sm font-black uppercase tracking-widest text-cyan-200">{edicion.titulo}</span>
                  </div>
                  <div className="flex gap-2">
                    <button aria-label="Edición anterior" onClick={() => change(-1)} className="flex h-11 w-11 items-center justify-center border border-white/15 bg-black/30 hover:bg-white/10"><ChevronLeftIcon className="h-5 w-5"/></button>
                    <button aria-label="Edición siguiente" onClick={() => change(1)} className="flex h-11 w-11 items-center justify-center border border-white/15 bg-black/30 hover:bg-white/10"><ChevronRightIcon className="h-5 w-5"/></button>
                  </div>
                </div>

                {edicion.esMulticategoria ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {edicion.categorias?.map((cat) => (
                      <div key={cat.nombre} className="border border-white/10 bg-black/30 p-5 transition-all hover:border-cyan-300/40">
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/55">
                          {cat.icono} {cat.nombre}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[9px] font-bold uppercase text-cyan-300">Campeón</p>
                            <p className="home-title text-3xl text-white">{cat.campeon}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                            <div>
                              <p className="text-[8px] font-bold uppercase text-white/45">Sub</p>
                              <p className="text-xs font-bold text-white/85">{cat.subcampeon}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold uppercase text-white/45">3ro</p>
                              <p className="text-xs font-bold text-white/85">{cat.tercero}</p>
                            </div>
                          </div>
                          <p className="pt-2 text-[10px] leading-tight italic text-white/50">{cat.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                    <div className="space-y-6">
                      <h4 className="home-title text-5xl text-white">{edicion.campeon}</h4>
                      <div className="flex gap-4">
                        <div className="flex-1 border border-white/10 bg-black/30 p-4">
                          <span className="text-[9px] font-bold uppercase text-white/45">Subcampeón</span>
                          <p className="font-bold text-white">{edicion.subcampeon}</p>
                        </div>
                        {edicion.tagTeam && (
                          <div className="flex-1 border border-cyan-400/20 bg-cyan-500/10 p-4">
                            <span className="text-[9px] font-bold uppercase text-cyan-300">Tag Team</span>
                            <p className="leading-tight font-bold text-cyan-100">{edicion.tagTeam}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-lg leading-relaxed italic text-white/70">{edicion.descripcion}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
