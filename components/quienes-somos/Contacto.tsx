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
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
      
      <header className="mb-10 text-center">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-300">Hablemos</p>
        <h2 className="font-[family-name:var(--font-display)] text-5xl font-bold uppercase italic leading-[0.85] tracking-[-0.035em] text-white sm:text-6xl">
          Conecta con el movimiento
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
          ¿Buscas organizar un torneo, contratar un show o llevar el programa terapéutico a tu institución?
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        
        {/* TARJETA 1: CONTACTO GENERAL (Booking & Torneos) */}
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardVariants}
          className="group relative overflow-hidden border border-cyan-300/35 bg-[#071016]/90 transition duration-300 hover:border-cyan-300/70 hover:shadow-[0_0_28px_rgba(34,211,238,0.14)] [clip-path:polygon(0_14px,14px_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%)]"
        >
          {/* Efecto Hover de Fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex h-full flex-col p-7">
            <div className="mb-6 flex h-12 w-12 items-center justify-center border border-cyan-300/40 bg-cyan-300/10 transition-transform group-hover:scale-105">
              <EnvelopeIcon className="h-6 w-6 text-cyan-300" aria-hidden="true" />
            </div>
            
            <h3 className="mb-2 font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic leading-none text-white">
              General & Booking
            </h3>
            <p className="mb-8 flex-grow text-sm leading-relaxed text-white/60">
              Para propuestas comerciales, shows, colaboraciones con marcas y dudas generales sobre la Liga Competitiva.
            </p>

            <Link 
              href="mailto:contacto.bbxcl@gmail.com"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-cyan-300/45 bg-cyan-300/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-cyan-300/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              <span>Enviar Correo</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

        {/* TARJETA 2: LIGA TERAPÉUTICA (Datos del PDF) */}
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardVariants}
          className="group relative overflow-hidden border border-fuchsia-300/35 bg-[#130915]/90 transition duration-300 hover:border-fuchsia-300/70 hover:shadow-[0_0_28px_rgba(232,121,249,0.14)] [clip-path:polygon(14px_0,100%_0,100%_100%,0_100%,0_14px)]"
        >
          {/* Efecto Hover de Fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-lime-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex h-full flex-col p-7">
            <div className="mb-6 flex h-12 w-12 items-center justify-center border border-fuchsia-300/40 bg-fuchsia-300/10 transition-transform group-hover:scale-105">
              <HeartIcon className="h-6 w-6 text-fuchsia-300" aria-hidden="true" />
            </div>
            
            <h3 className="mb-2 font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic leading-none text-white">
              Salud & Educación
            </h3>
            <p className="mb-8 flex-grow text-sm leading-relaxed text-white/60">
              Contacto directo con la Dirección de la Liga Terapéutica para intervenciones en colegios y centros de salud.
            </p>

            <Link 
              // Email extraído del PDF [cite: 256]
              href="mailto:jfbermudez@uc.cl"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-fuchsia-300/45 bg-fuchsia-300/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-fuchsia-300/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-300"
            >
              <span>Contactar Dirección</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}