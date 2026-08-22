"use client";

import { motion } from "framer-motion";
import { 
  HeartIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  ScaleIcon 
} from "@heroicons/react/24/solid";

export default function PropositoTerap() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* COLUMNA IZQUIERDA: La Definición Central */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-linear-to-r from-emerald-400 to-cyan-400 opacity-15 blur transition duration-700 group-hover:opacity-25" />
          <div className="relative flex h-full flex-col justify-center border border-emerald-300/40 bg-[#07110f]/95 p-8 [clip-path:polygon(0_14px,14px_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%)]">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="border border-emerald-300/35 bg-emerald-300/10 p-3">
                <HeartIcon className="h-8 w-8 text-emerald-300" aria-hidden="true" />
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic leading-none text-white sm:text-5xl">
                Propósito <span className="text-emerald-300">clínico</span>
              </h2>
            </div>

            <p className="text-xl text-white/90 font-medium leading-relaxed mb-6">
              “Estimulación comunicativa, participación social y autorregulación emocional a través del beatbox.”
            </p>
            
            <p className="text-white/50 text-sm leading-relaxed">
              Nuestra misión es expandir el impacto del arte en ámbitos comunitarios, educativos y terapéuticos, articulando la salud mental con un enfoque participativo e inclusivo.
            </p>

          </div>
        </motion.div>

        {/* COLUMNA DERECHA: Objetivos Específicos (Grid de Tarjetas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tarjeta 1: Inclusión */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="border border-emerald-300/20 bg-[#07110f]/90 p-6 transition hover:border-emerald-300/50 [clip-path:polygon(0_10px,10px_0,100%_0,100%_100%,0_100%)]"
          >
            <UserGroupIcon className="w-6 h-6 text-lime-400 mb-3" />
            <h3 className="text-white font-bold uppercase text-sm mb-2">Inclusión Social</h3>
            <p className="text-white/40 text-xs">
              Fomentar la cooperación, el liderazgo positivo y la cohesión grupal.
            </p>
          </motion.div>

          {/* Tarjeta 2: Neuropsicología */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} 
            transition={{ delay: 0.4 }}
            className="border border-cyan-300/20 bg-[#071014]/90 p-6 transition hover:border-cyan-300/50 [clip-path:polygon(10px_0,100%_0,100%_100%,0_100%,0_10px)]"
          >
            <SparklesIcon className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-white font-bold uppercase text-sm mb-2">Estimulación</h3>
            <p className="text-white/40 text-xs">
              Trabajo directo sobre la atención, memoria y funciones ejecutivas.
            </p>
          </motion.div>

          {/* Tarjeta 3: Autorregulación */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="border border-teal-300/20 bg-[#07110f]/90 p-6 transition hover:border-teal-300/50 [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_10px),calc(100%_-_10px)_100%,0_100%)]"
          >
            <ScaleIcon className="w-6 h-6 text-teal-400 mb-3" />
            <h3 className="text-white font-bold uppercase text-sm mb-2">Regulación</h3>
            <p className="text-white/40 text-xs">
              Herramientas para la gestión emocional y expresión segura.
            </p>
          </motion.div>

          {/* Tarjeta 4: Autoestima */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="border border-fuchsia-300/20 bg-[#100a13]/90 p-6 transition hover:border-fuchsia-300/50 [clip-path:polygon(0_0,calc(100%_-_10px)_0,100%_10px,100%_100%,0_100%)]"
          >
            <HeartIcon className="w-6 h-6 text-rose-400 mb-3" />
            <h3 className="text-white font-bold uppercase text-sm mb-2">Autoestima</h3>
            <p className="text-white/40 text-xs">
              Fortalecimiento de la identidad y la confianza personal a través de la voz.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}