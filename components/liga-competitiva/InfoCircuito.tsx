"use client";

import { motion } from "framer-motion";
import { 
  TrophyIcon, 
  GlobeAltIcon, 
  WifiIcon, 
  AcademicCapIcon 
} from "@heroicons/react/24/solid";

export default function InfoCircuito() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
      
      {/* FONDO IDENTIFICADOR: Grid Táctico (Cyberpunk Style) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        
        {/* COLUMNA IZQUIERDA: Misión Principal */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="inline-block border border-amber-200/40 bg-amber-200/10 p-3 shadow-[0_0_20px_rgba(250,204,21,0.16)]">
            <TrophyIcon className="h-8 w-8 text-amber-200" aria-hidden="true" />
          </div>
          
          <h2 className="font-[family-name:var(--font-display)] text-5xl font-bold uppercase italic leading-[0.85] tracking-[-0.035em] text-white sm:text-6xl">
            Circuito <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-fuchsia-300">Profesional</span>
          </h2>

          <p className="text-lg text-white/70 font-light leading-relaxed">
            La plataforma oficial que profesionaliza el beatbox en Chile. Gestionamos competencias de alto nivel y formamos a la próxima generación de atletas vocales.
          </p>

          <div className="flex flex-wrap gap-3">
            <span className="border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-100">
              Ranking Nacional
            </span>
            <span className="px-3 py-1 rounded bg-fuchsia-900/30 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold uppercase tracking-wider">
              Panamericano
            </span>
            <span className="px-3 py-1 rounded bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              Streaming
            </span>
          </div>
        </motion.div>

        {/* COLUMNA DERECHA: Features Grid (Bento Box Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Feature 1: Alcance */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group border border-amber-200/25 bg-[#0c0b17]/90 p-6 transition duration-300 hover:border-amber-200/55 [clip-path:polygon(0_12px,12px_0,100%_0,100%_100%,0_100%)]"
          >
            <GlobeAltIcon className="w-6 h-6 text-blue-500 group-hover:text-blue-400 mb-3 transition-colors" />
            <h3 className="text-white font-bold uppercase text-sm mb-1">Alcance Global</h3>
            <p className="text-white/40 text-xs leading-relaxed">
              Gestión de torneos a nivel nacional y alianzas internacionales.
            </p>
          </motion.div>

          {/* Feature 2: Formato Híbrido */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group border border-cyan-300/25 bg-[#080e16]/90 p-6 transition duration-300 hover:border-cyan-300/55 [clip-path:polygon(12px_0,100%_0,100%_100%,0_100%,0_12px)]"
          >
            <WifiIcon className="w-6 h-6 text-cyan-500 group-hover:text-cyan-400 mb-3 transition-colors" />
            <h3 className="text-white font-bold uppercase text-sm mb-1">Presencial & Virtual</h3>
            <p className="text-white/40 text-xs leading-relaxed">
              Infraestructura tecnológica para batallas en vivo y vía streaming.
            </p>
          </motion.div>

          {/* Feature 3: Formación */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group border border-fuchsia-300/25 bg-[#110917]/90 p-6 transition duration-300 hover:border-fuchsia-300/55 sm:col-span-2 [clip-path:polygon(0_0,calc(100%_-_12px)_0,100%_12px,100%_100%,0_100%)]"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-fuchsia-500/10 rounded-lg">
                 <AcademicCapIcon className="w-6 h-6 text-fuchsia-500 group-hover:text-fuchsia-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-white font-bold uppercase text-sm mb-1">Formación de Atletas</h3>
                <p className="text-white/40 text-xs leading-relaxed">
                  Especialización técnica y psicología deportiva para potenciar el rendimiento del artista urbano.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}