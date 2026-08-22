"use client";

import { motion } from "framer-motion";
import { 
  ClipboardDocumentCheckIcon, 
  ClockIcon, 
  UserGroupIcon, 
  SpeakerWaveIcon,
} from "@heroicons/react/24/solid";

export default function RegistroTerap() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
      
      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-10">
        <div className="border border-emerald-300/35 bg-emerald-300/10 p-3 shadow-[0_0_20px_rgba(16,185,129,0.16)]">
          <ClipboardDocumentCheckIcon className="h-8 w-8 text-emerald-300" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic leading-none text-white sm:text-5xl">
            Implementación <span className="text-emerald-300">del programa</span>
          </h2>
          <p className="text-white/40 text-sm font-medium tracking-widest uppercase mt-1">
            Logística & Requisitos Técnicos
          </p>
        </div>
      </div>

      {/* Grid de Requisitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* TARJETA 1: El Equipo (Dupla Psico-Artística) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="group border border-emerald-300/25 bg-[#07110f]/95 p-6 transition duration-300 hover:border-emerald-300/55 [clip-path:polygon(0_12px,12px_0,100%_0,100%_100%,0_100%)]"
        >
          <div className="flex items-center gap-3 mb-4">
            <UserGroupIcon className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-black italic uppercase text-white">El Equipo</h3>
          </div>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="text-emerald-500">●</span>
              <span>
                <strong className="text-white">Líder Clínico:</strong> 1 Fonoaudiólogo/a.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">●</span>
              <span>
                <strong className="text-white">Líder Artístico:</strong> 1 Beatboxer experto.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">●</span>
              <span>
                <strong className="text-white">Supervisión:</strong> Directora Liga Terapéutica.
              </span>
            </li>
          </ul>
        </motion.div>

        {/* TARJETA 2: Formato (Sesiones y Duración) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="group border border-teal-300/25 bg-[#071111]/95 p-6 transition duration-300 hover:border-teal-300/55 [clip-path:polygon(12px_0,100%_0,100%_100%,0_100%,0_12px)]"
        >
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="w-6 h-6 text-teal-400" />
            <h3 className="text-lg font-black italic uppercase text-white">Formato</h3>
          </div>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="text-teal-500">●</span>
              <span>
                <strong className="text-white">Duración:</strong> 8 Sesiones (2 meses).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-500">●</span>
              <span>
                <strong className="text-white">Tiempo:</strong> 60 minutos por sesión (Equilibra atención y fatiga).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-500">●</span>
              <span>
                <strong className="text-white">Capacidad:</strong> ~15 estudiantes por grupo.
              </span>
            </li>
          </ul>
        </motion.div>

        {/* TARJETA 3: Espacio y Sonido (Tech Rider) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="group border border-cyan-300/25 bg-[#071014]/95 p-6 transition duration-300 hover:border-cyan-300/55 [clip-path:polygon(0_0,calc(100%_-_12px)_0,100%_12px,100%_100%,0_100%)]"
        >
          <div className="flex items-center gap-3 mb-4">
            <SpeakerWaveIcon className="w-6 h-6 text-lime-400" />
            <h3 className="text-lg font-black italic uppercase text-white">Logística</h3>
          </div>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="text-lime-500">●</span>
              <span>
                <strong className="text-white">Sonido:</strong> 3 Micrófonos + Amplificación con limitador (85dB).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-lime-500">●</span>
              <span>
                <strong className="text-white">Sala:</strong> Espacio accesible, sillas en semicírculo, baja reverberación.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-lime-500">●</span>
              <span>
                <strong className="text-white">Apoyos:</strong> Agua y material visual (pictogramas).
              </span>
            </li>
          </ul>
        </motion.div>

      </div>

      {/* Nota al pie del PDF */}
      <div className="mt-6 text-center">
        <p className="text-white/30 text-xs italic">
          * Se requieren 3 adultos de apoyo por grupo de 15 estudiantes (1 cada 5).
        </p>
      </div>

    </section>
  );
}