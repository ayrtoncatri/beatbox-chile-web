"use client";

import { motion, Variants } from "framer-motion";
import { EnvelopeIcon, HeartIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

// Animaciones tipadas correctamente
const cardVariants: Variants = {
  offscreen: { y: 50, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8
    }
  }
};

export default function Contacto() {
  return (
    <section className="relative z-10 max-w-5xl mx-auto py-20 px-4">
      
      {/* Header de Sección */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-4">
          Conecta con el <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-blue-500">Movimiento</span>
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          ¿Buscas organizar un torneo, contratar un show o llevar el programa terapéutico a tu institución?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* TARJETA 1: CONTACTO GENERAL (Booking & Torneos) */}
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardVariants}
          className="group relative overflow-hidden rounded-2xl bg-[#0c0c12]/80 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 transition-colors duration-300"
        >
          {/* Efecto Hover de Fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 p-8 flex flex-col h-full">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <EnvelopeIcon className="w-6 h-6 text-blue-400" />
            </div>
            
            <h3 className="text-2xl font-black italic uppercase text-white mb-2">
              General & Booking
            </h3>
            <p className="text-white/60 text-sm mb-8 flex-grow">
              Para propuestas comerciales, shows, colaboraciones con marcas y dudas generales sobre la Liga Competitiva.
            </p>

            <Link 
              href="mailto:contacto.bbxcl@gmail.com"
              className="inline-flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              <span>Enviar Correo</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* TARJETA 2: LIGA TERAPÉUTICA (Datos del PDF) */}
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardVariants}
          className="group relative overflow-hidden rounded-2xl bg-[#0c0c12]/80 backdrop-blur-xl border border-white/10 hover:border-lime-500/50 transition-colors duration-300"
        >
          {/* Efecto Hover de Fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-lime-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 p-8 flex flex-col h-full">
            <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center mb-6 border border-lime-500/30 group-hover:scale-110 transition-transform">
              <HeartIcon className="w-6 h-6 text-lime-400" />
            </div>
            
            <h3 className="text-2xl font-black italic uppercase text-white mb-2">
              Salud & Educación
            </h3>
            <p className="text-white/60 text-sm mb-8 flex-grow">
              Contacto directo con la Dirección de la Liga Terapéutica para intervenciones en colegios y centros de salud.
            </p>

            <Link 
              // Email extraído del PDF [cite: 256]
              href="mailto:jfbermudez@uc.cl"
              className="inline-flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-lime-600 border border-white/10 hover:border-lime-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(132,204,22,0.4)]"
            >
              <span>Contactar Dirección</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}