"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { HandRaisedIcon, SparklesIcon } from "@heroicons/react/24/solid";

// Datos reales extraídos del PDF [cite: 5, 6, 21, 37]
const colaboradores = [
  { 
    nombre: "C33K", 
    rol: "Colaborador Oficial", 
    logo: "", // Asegúrate de subir estos logos a public/logos/
    color: "hover:border-cyan-500/50 hover:shadow-cyan-500/20"
  },
  { 
    nombre: "Artes y Salud Mental", 
    rol: "Alianza Estratégica", 
    logo: "",
    color: "hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20"
  },
  { 
    nombre: "Bonsai Films", 
    rol: "Producción Audiovisual", 
    logo: "", 
    color: "hover:border-blue-500/50 hover:shadow-blue-500/20"
  },
  { 
    nombre: "Universidad de Chile", 
    rol: "Respaldo Académico", 
    logo: "", 
    color: "hover:border-white/50 hover:shadow-white/20"
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 }
};

export default function Colaboradores() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 pb-16">
      
      {/* Header de Sección */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="p-3 bg-white/5 rounded-full mb-4 border border-white/10">
          <HandRaisedIcon className="w-6 h-6 text-white/60" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
          Aliados <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Estratégicos</span>
        </h2>
        <p className="text-white/40 text-sm mt-2 max-w-2xl">
          Organizaciones que impulsan el crecimiento y la profesionalización del Beatbox en Chile.
        </p>
      </div>

      {/* Grid de Logos */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {colaboradores.map((col, i) => (
          <motion.div
            key={i}
            variants={item}
            className={`group relative h-40 flex flex-col items-center justify-center bg-[#0b1121]/60 backdrop-blur-sm border border-white/5 rounded-xl transition-all duration-300 ${col.color}`}
          >
            {/* Logo Container */}
            <div className="relative w-24 h-24 mb-2 transition-transform duration-300 group-hover:scale-110">
              {/* Lógica de Imagen con Fallback (Texto si no hay logo) */}
              {col.logo ? (
                <Image 
                  src={col.logo} 
                  alt={col.nombre} 
                  fill
                  className="object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0"
                  onError={(e) => {
                    // Si falla la imagen, ocultamos la etiqueta Image para mostrar el texto de respaldo
                    e.currentTarget.style.display = 'none';
                    // Activamos visualmente el contenedor de texto (hack visual)
                    e.currentTarget.parentElement?.classList.add('fallback-active');
                  }}
                />
              ) : null}

              {/* Fallback Text (Visible si no hay imagen o si falla la carga) */}
              <div className="absolute inset-0 flex items-center justify-center -z-10 group-hover:z-10">
                <span className="text-xl font-black uppercase text-white/20 group-hover:text-white transition-colors text-center leading-none">
                  {col.nombre}
                </span>
              </div>
            </div>

            {/* Rol del Colaborador */}
            <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 bg-black/50 px-2 py-1 rounded-full">
                {col.rol}
              </span>
            </div>

            {/* Efecto Shine al pasar el mouse */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action para nuevos sponsors */}
      <div className="mt-12 text-center">
        <button className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
          <SparklesIcon className="w-4 h-4" />
          <span>¿Quieres ser parte del movimiento? Contáctanos</span>
        </button>
      </div>

    </section>
  );
}