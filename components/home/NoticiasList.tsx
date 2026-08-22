"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { SparklesIcon, BoltIcon } from "@heroicons/react/24/solid";

const noticiaPrincipal = {
  title: "CIRCUITO 2026",
  subtitle: "EL RENACER DEL BEATBOX CHILENO",
  fullInfo: "Presentamos oficialmente el calendario de la temporada. Un año cargado de batallas, nuevos formatos y evolución artística. ¿Tienes lo necesario para dominar el micrófono? 🎤",
  img: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1767553531/beatbox-chile-circuito-2026_pjhhsx.webp",
  date: "04 Ene 2026",
  category: "ANUNCIO OFICIAL",
  calendario: [
    { fecha: "08/02", nombre: "7ven to Beat Online", tipo: "Amistoso", highlight: false },
    { fecha: "01/03", nombre: "Torneo Clásico Online", tipo: "Clasificatorio Nacional", highlight: true },
    { fecha: "18/04", nombre: "7ven to Beat Presencial", tipo: "Amistoso", highlight: false },
    { fecha: "30/05", nombre: "Squad Battles 🆕", tipo: "Equipos de 4", highlight: true },
    { fecha: "11/07", nombre: "Torneo Clásico Presencial", tipo: "Clasificatorio Nacional", highlight: true },
    { fecha: "15/08", nombre: "King of the Stage 🆕", tipo: "Showcase Battle", highlight: true },
    { fecha: "01-14/09", nombre: "Periodo Wildcards", tipo: "Solo / Tag / Loop", highlight: false },
    { fecha: "21/11", nombre: "FINAL NACIONAL 8ª EDICIÓN", tipo: "Evento Mayor", highlight: true },
  ]
};

export default function NoticiasList() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] bg-cyan-500/10 blur-[120px]" />
      <div className="absolute right-1/4 bottom-0 h-[500px] w-[500px] bg-fuchsia-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="mb-4 flex items-center gap-3"
          >
            <span className="h-[2px] w-12 bg-linear-to-r from-fuchsia-500 to-transparent" />
            <span className="home-kicker text-fuchsia-300">
              <BoltIcon className="h-4 w-4" /> Noticias de temporada
            </span>
          </motion.div>
          <h2 className="home-title text-5xl text-white md:text-8xl">
            Circuito <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-white to-fuchsia-400">2026</span>
          </h2>
        </div>

        <div className="home-card home-card-cyan grid grid-cols-1 overflow-hidden lg:grid-cols-12">
          <div className="relative min-h-[420px] lg:col-span-5">
            <Image
              src={noticiaPrincipal.img}
              alt="Flyer 2026"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#05060d] via-transparent to-black/20" />
            <div className="absolute right-6 bottom-8 left-6 border border-white/15 bg-black/50 p-5 backdrop-blur-xl">
              <p className="home-title text-3xl text-white">{noticiaPrincipal.subtitle}</p>
              <div className="mt-2 flex items-center gap-2 text-xs font-black tracking-widest text-cyan-300">
                <SparklesIcon className="h-4 w-4" /> ACTUALIZADO ENERO 2026
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 lg:col-span-7 md:p-12">
            <p className="mb-8 text-base leading-relaxed font-medium text-white/75 md:text-lg">
              {noticiaPrincipal.fullInfo}
            </p>

            <div className="relative grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              <div className="absolute top-0 bottom-0 left-1/2 hidden w-px bg-linear-to-b from-transparent via-white/15 to-transparent md:block" />

              {noticiaPrincipal.calendario.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative flex items-center group"
                >
                  <div className={`flex flex-col ${item.highlight ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity`}>
                    <div className="mb-1 flex items-center gap-3">
                      <span className={`text-sm font-black italic ${item.highlight ? 'text-fuchsia-300' : 'text-cyan-300'}`}>
                        {item.fecha}
                      </span>
                      <span className="h-px w-4 bg-white/20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">{item.tipo}</span>
                    </div>
                    <h4 className={`text-lg font-black tracking-tight leading-tight uppercase italic ${item.highlight ? 'text-white' : 'text-white/70'}`}>
                      {item.nombre}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10">
              <span className="text-[10px] font-bold tracking-widest text-white/45 uppercase">
                #BEATBOXCHILE2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
