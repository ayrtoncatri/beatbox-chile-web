"use client";

import { motion } from "framer-motion";
import { 
  EnvelopeIcon, 
  UserCircleIcon, 
  ArrowTopRightOnSquareIcon 
} from "@heroicons/react/24/solid";
import { FaInstagram } from "react-icons/fa"; // Mantenemos react-icons para logos de marcas

export default function ContactoTerap() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6">
      
      {/* Decoración de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-emerald-900/10 blur-[100px] -z-10" />

      <div className="text-center mb-12">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-5xl font-bold uppercase italic leading-none text-white sm:text-6xl">
          Inicia la <span className="text-emerald-300">intervención</span>
        </h2>
        <p className="text-white/50 text-sm font-medium tracking-widest uppercase">
          Canales de comunicación oficial
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* TARJETA PRINCIPAL: Contacto Profesional (Directora) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="group relative overflow-hidden border border-emerald-300/30 bg-[#07110f]/95 p-8 transition duration-300 hover:border-emerald-300/60 md:col-span-3 [clip-path:polygon(0_14px,14px_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%)]"
        >
          {/* Efecto Hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/20 rounded-full">
                  <UserCircleIcon className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase text-white leading-none">
                    Javiera Bermúdez Rojas
                  </h3>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                    Directora Liga Terapéutica
                  </span>
                </div>
              </div>
              
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Para consultas sobre implementación del programa “Beatbox Inclusivo”, supervisión de objetivos neuropsicológicos y validación técnica en instituciones.
              </p>
            </div>

            <a 
              href="mailto:jfbermudez@uc.cl"
              className="group/btn flex min-h-12 w-full items-center justify-between border border-emerald-300/40 bg-emerald-300/10 p-4 text-emerald-200 transition hover:bg-emerald-300 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-200"
            >
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5" />
                <span className="font-bold uppercase tracking-wider text-sm">Enviar Correo Profesional</span>
              </div>
              <ArrowTopRightOnSquareIcon className="w-5 h-5 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
            </a>
            
            {/* Correo visible pequeño */}
            <p className="mt-3 text-xs text-white/20 font-mono text-center md:text-left pl-1">
              jfbermudez@uc.cl
            </p>
          </div>
        </motion.div>

        {/* TARJETA SECUNDARIA: Comunidad (Instagram) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="group relative flex flex-col items-center justify-center overflow-hidden border border-fuchsia-300/25 bg-linear-to-b from-[#100a13] to-[#050505] p-8 text-center transition duration-300 hover:border-fuchsia-300/55 md:col-span-2 [clip-path:polygon(14px_0,100%_0,100%_100%,0_100%,0_14px)]"
        >
          <div className="mb-4 p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-300">
            <FaInstagram className="w-10 h-10 text-white group-hover:text-fuchsia-400 transition-colors" />
          </div>
          
          <h3 className="text-xl font-black italic uppercase text-white mb-2">
            Comunidad
          </h3>
          <p className="text-white/50 text-xs mb-6">
            Sigue las actividades, fotos de talleres y novedades del equipo en nuestras redes sociales.
          </p>

          <a 
            href="https://www.instagram.com/beatbox.chile?igsh=MXZqYXRmYmNic2ZidQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 border border-fuchsia-300/35 bg-fuchsia-300/10 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-fuchsia-300/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-300"
          >
            <span>@beatboxchile_oficial</span> 
          </a>
        </motion.div>

      </div>
    </section>
  );
}