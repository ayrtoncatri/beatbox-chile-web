"use client";

import { motion } from "framer-motion";
import { 
  ScaleIcon, 
  MicrophoneIcon, 
  MusicalNoteIcon, 
  HandThumbUpIcon,
  DocumentTextIcon 
} from "@heroicons/react/24/solid";

const rules = [
  {
    title: "Formatos Oficiales",
    icon: <MicrophoneIcon className="w-6 h-6 text-cyan-400" />,
    items: [
      "Solo Battle (1vs1): 2 Rondas de 90 seg.",
      "Tag Team: 2vs2, Rutinas sincronizadas.",
      "Loopstation: Creación en vivo (RC-505)."
    ],
    color: "border-cyan-500/30 bg-cyan-900/10"
  },
  {
    title: "Criterios de Jueceo",
    icon: <ScaleIcon className="w-6 h-6 text-fuchsia-400" />,
    items: [
      "Musicalidad: Ritmo, armonía y flujo.",
      "Técnica: Limpieza, complejidad y ejecución.",
      "Originalidad: Estilo propio y creatividad.",
      "Showmanship: Presencia escénica."
    ],
    color: "border-fuchsia-500/30 bg-fuchsia-900/10"
  },
  {
    title: "Código de Conducta",
    icon: <HandThumbUpIcon className="w-6 h-6 text-blue-400" />,
    items: [
      "Respeto absoluto al rival (Fair Play).",
      "Prohibido el contacto físico agresivo.",
      "Cero tolerancia a discriminación o discurso de odio.",
      "Puntualidad en check-in y soundcheck."
    ],
    color: "border-blue-500/30 bg-blue-900/10"
  }
];

export default function ReglasLiga() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Reglamento <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Oficial</span>
          </h2>
          <p className="text-white/50 text-sm font-medium tracking-widest uppercase mt-1">
            Normativa vigente Temporada 2025
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition-all group">
          <DocumentTextIcon className="w-5 h-5 text-white/60 group-hover:text-cyan-400" />
          <span className="text-xs font-bold uppercase text-white/80 group-hover:text-white">Descargar PDF Completo</span>
        </button>
      </div>

      {/* Grid de Reglas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rules.map((rule, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative overflow-hidden rounded-2xl border ${rule.color} backdrop-blur-md p-1`}
          >
            <div className="bg-[#0b1121]/90 h-full rounded-xl p-6 relative z-10 hover:bg-[#0b1121]/70 transition-colors duration-300">
              
              {/* Icono Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  {rule.icon}
                </div>
                <h3 className="text-lg font-black italic uppercase text-white leading-none">
                  {rule.title}
                </h3>
              </div>

              {/* Lista */}
              <ul className="space-y-3">
                {rule.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}