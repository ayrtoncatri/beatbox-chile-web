"use client";

import { motion } from "framer-motion";
import { 
  ClipboardDocumentCheckIcon, 
  ClockIcon, 
  UserGroupIcon, 
  SpeakerWaveIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/solid";

export default function RegistroTerap() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4">
      
      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <ClipboardDocumentCheckIcon className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
            Implementación <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Del Programa</span>
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
          className="group bg-[#0c0c12]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-emerald-500/50 transition-all duration-300"
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
          className="group bg-[#0c0c12]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-teal-500/50 transition-all duration-300"
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
          className="group bg-[#0c0c12]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-lime-500/50 transition-all duration-300"
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