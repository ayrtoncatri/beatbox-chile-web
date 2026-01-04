"use client";
import Image from "next/image";
import { motion } from "framer-motion"; // Usaremos framer-motion para dar vida
import { 
  CalendarDaysIcon, 
  FireIcon, 
  RocketLaunchIcon, 
  SparklesIcon,
  BoltIcon
} from "@heroicons/react/24/solid";

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
    <section className="py-20 relative overflow-hidden bg-[#020205]">
      {/* --- LUCES DE AMBIENTE DINÁMICAS --- */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* ENCABEZADO ESTILO TV */}
        <div className="flex flex-col mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="h-[2px] w-12 bg-gradient-to-r from-red-600 to-transparent" />
            <span className="text-red-500 font-black text-xs tracking-[0.4em] flex items-center gap-2">
              <BoltIcon className="w-4 h-4" /> NOTICIAS DE TEMPORADA
            </span>
          </motion.div>
          <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter leading-none">
            CIRCUITO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-white to-red-500 underline decoration-red-600/30">2026</span>
          </h2>
        </div>

        {/* TARJETA MAESTRA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-[40px] overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          
          {/* LADO IZQUIERDO: FLYER CON OVERLAY */}
          <div className="lg:col-span-5 relative group min-h-[500px]">
            <Image
              src={noticiaPrincipal.img}
              alt="Flyer 2026"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-black/20" />
            
            {/* Badge Flotante */}
            <div className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
              <p className="text-white font-bold text-xl italic mb-1">{noticiaPrincipal.subtitle}</p>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-black tracking-widest">
                <SparklesIcon className="w-4 h-4" /> ACTUALIZADO ENERO 2026
              </div>
            </div>
          </div>

          {/* LADO DERECHO: CALENDARIO TIPO TIMELINE */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-white/[0.03] to-transparent">
            <p className="text-gray-300 text-lg mb-10 leading-relaxed font-medium">
              {noticiaPrincipal.fullInfo}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 relative">
              {/* Línea decorativa central en MD */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

              {noticiaPrincipal.calendario.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative flex items-center group"
                >
                  <div className={`flex flex-col ${item.highlight ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity`}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-sm font-black italic ${item.highlight ? 'text-red-500' : 'text-blue-400'}`}>
                        {item.fecha}
                      </span>
                      <span className="h-[1px] w-4 bg-white/20" />
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.tipo}</span>
                    </div>
                    <h4 className={`text-lg font-black tracking-tight leading-tight uppercase italic ${item.highlight ? 'text-white' : 'text-gray-400'}`}>
                      {item.nombre}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA FOOTER */}
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
              <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                #BEATBOXCHILE2026
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}