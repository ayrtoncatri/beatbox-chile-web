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
    color: "from-blue-500/20",
    descripcion: `La primera edición del campeonato nacional, se realizó un 1 de Octubre del 2007 durante el evento Streetbox Fest en La Florida. Eran los inicios del beatbox competitivo en Chile y aquí aparecen los primeros exponentes que abrieron camino a lo que somos ahora.`,
  },
  {
    año: 2008,
    titulo: "Segunda Edición",
    campeon: "Creabeatbox",
    subcampeon: "Migraña",
    tagTeam: null,
    color: "from-red-500/20",
    descripcion: `El 31 de Julio del 2008 se realiza la segunda edición. Creabeatbox, tras coronarse campeón, catapultó su carrera musical y colaboró con grandes del Hip-Hop Nacional.`,
  },
  {
    año: 2012,
    titulo: "Tercera Edición",
    campeon: "Mr. Androide",
    subcampeon: "Besbecko",
    tagTeam: null,
    color: "from-purple-500/20",
    descripcion: `El 19 de Octubre del 2012, primera vez organizado por los pilares de Beatbox Chile. Mr. Androide clasifica al Mundial y junto a Cat Negro representan a Chile en Alemania.`,
  },
  {
    año: 2015,
    titulo: "Cuarta Edición",
    campeon: "Onetime",
    subcampeon: "Vintrex",
    tagTeam: "Spectros Family (BCJ & MC Sura)",
    color: "from-green-500/20",
    descripcion: `El 5 de Diciembre en el anfiteatro El Cortijo, con jurado internacional. Onetime gana y clasifica al Mundial de Alemania 2018.`,
  },
  {
    año: 2016,
    titulo: "Quinta Edición",
    campeon: "Ex-bitt",
    subcampeon: "Karloz",
    tagTeam: "Trakloz (Trako & Karloz)",
    color: "from-yellow-500/20",
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
    color: "from-red-600/20",
    esMulticategoria: true,
    categorias: [
      {
        nombre: "SOLO BATTLE",
        icono: <TrophyIcon className="w-4 h-4 text-yellow-500" />,
        campeon: "Xiphire",
        subcampeon: "Inferno",
        tercero: "Ex-BiTT",
        bio: "Xiphire alcanza el BICAMPEONATO. Consistencia y madurez artística que reafirma su nombre en la historia."
      },
      {
        nombre: "TAG TEAM",
        icono: <UserGroupIcon className="w-4 h-4 text-blue-500" />,
        campeon: "Perpetual Inmortalem",
        subcampeon: "1+1",
        tercero: "D-Auditive",
        bio: "Blvckned + Ex-BiTT dominaron con una propuesta sólida y agresiva."
      },
      {
        nombre: "LOOPSTATION",
        icono: <CpuChipIcon className="w-4 h-4 text-purple-500" />,
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
  const [idx, setIdx] = useState(historialCampeonato.length - 1); // Empezamos en 2025 por ser la novedad
  const [direction, setDirection] = useState(0);
  const total = historialCampeonato.length;

  const change = (dir: number) => {
    setDirection(dir);
    setIdx((prev) => (prev + dir + total) % total);
  };

  const edicion = historialCampeonato[idx];

  return (
    <section className="w-full max-w-6xl mx-auto py-20 px-4 relative">
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gradient-to-r ${edicion.color} to-transparent rounded-full blur-[120px] opacity-20 transition-all duration-1000`} />

      <div className="text-center mb-12 relative z-10">
        <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
          EL LEGADO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-red-500">HISTÓRICO</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* LADO IZQUIERDO: TIMELINE */}
        <div className="lg:col-span-2 flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-4 lg:pb-0">
          {historialCampeonato.map((item, i) => (
            <button key={item.año} onClick={() => { setDirection(i > idx ? 1 : -1); setIdx(i); }}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${i === idx ? 'bg-white/10' : 'opacity-30 hover:opacity-100'}`}>
              <span className={`text-xl font-black italic ${i === idx ? 'text-white' : 'text-gray-500'}`}>{item.año}</span>
            </button>
          ))}
        </div>

        {/* LADO DERECHO: CONTENIDO */}
        <div className="lg:col-span-10">
          <div className="bg-[#0c0c12]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 min-h-[550px]">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div key={idx} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="space-y-8">
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-blue-400 font-black tracking-widest uppercase text-sm">{edicion.titulo}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => change(-1)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <button onClick={() => change(1)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronRightIcon className="w-5 h-5"/></button>
                  </div>
                </div>

                {edicion.esMulticategoria ? (
                  // DISEÑO ESPECIAL 2025 (MÚLTIPLES CATEGORÍAS)
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {edicion.categorias?.map((cat) => (
                      <div key={cat.nombre} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all">
                        <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {cat.icono} {cat.nombre}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-yellow-500 text-[9px] font-bold uppercase">🥇 Campeón</p>
                            <p className="text-xl font-black text-white italic">{cat.campeon}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                            <div>
                              <p className="text-gray-500 text-[8px] font-bold uppercase">🥈 Sub</p>
                              <p className="text-xs font-bold text-gray-300">{cat.subcampeon}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-[8px] font-bold uppercase">🥉 3ro</p>
                              <p className="text-xs font-bold text-gray-300">{cat.tercero}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-500 italic leading-tight pt-2">{cat.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // DISEÑO CLÁSICO (AÑOS ANTERIORES)
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h4 className="text-5xl font-black text-white uppercase italic">{edicion.campeon}</h4>
                      <div className="flex gap-4">
                        <div className="p-4 bg-white/5 rounded-xl flex-1">
                          <span className="text-[9px] text-gray-500 font-bold uppercase">Subcampeón</span>
                          <p className="font-bold text-white">{edicion.subcampeon}</p>
                        </div>
                        {edicion.tagTeam && (
                          <div className="p-4 bg-blue-500/10 rounded-xl flex-1 border border-blue-500/20">
                            <span className="text-[9px] text-blue-400 font-bold uppercase">Tag Team</span>
                            <p className="font-bold text-blue-100 leading-tight">{edicion.tagTeam}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 italic text-lg leading-relaxed">{edicion.descripcion}</p>
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