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
    <section className="relative z-10 max-w-6xl mx-auto px-4">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* COLUMNA IZQUIERDA: La Definición Central */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-lime-500 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#0c0c12]/90 backdrop-blur-xl border border-white/10 p-8 rounded-2xl h-full flex flex-col justify-center">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-lime-500/20 rounded-lg border border-lime-500/30">
                <HeartIcon className="w-8 h-8 text-lime-400" />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                Propósito <span className="text-lime-500">Clínico</span>
              </h2>
            </div>

            <p className="text-xl text-white/90 font-medium leading-relaxed mb-6">
              "Estimulación comunicativa, participación social y autorregulación emocional a través del beatbox." 
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
            className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-xl hover:border-lime-500/30 transition-colors"
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
            className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-xl hover:border-lime-500/30 transition-colors"
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
            className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-xl hover:border-lime-500/30 transition-colors"
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
            className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-xl hover:border-lime-500/30 transition-colors"
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