"use client";

import { motion } from "framer-motion";
import { 
  ScaleIcon, 
  MicrophoneIcon, 
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
    <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-5xl font-bold uppercase italic leading-none text-white sm:text-6xl">
            Reglamento <span className="text-amber-200">oficial</span>
          </h2>
          <p className="text-white/50 text-sm font-medium tracking-widest uppercase mt-1">
            Normativa vigente Temporada 2025
          </p>
        </div>

        <button className="group flex min-h-11 items-center gap-2 border border-amber-200/30 bg-amber-200/5 px-5 py-2 transition hover:border-amber-200/60 hover:bg-amber-200/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200">
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
            className={`relative overflow-hidden border ${rule.color} p-1 [clip-path:polygon(0_12px,12px_0,100%_0,100%_calc(100%_-_12px),calc(100%_-_12px)_100%,0_100%)]`}
          >
            <div className="relative z-10 h-full bg-[#090b14]/95 p-6 transition-colors duration-300 hover:bg-[#0d101b]">
              
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