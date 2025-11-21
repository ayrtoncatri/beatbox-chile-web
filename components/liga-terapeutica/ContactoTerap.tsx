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
    <section className="relative z-10 max-w-5xl mx-auto px-4 py-16">
      
      {/* Decoración de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-emerald-900/10 blur-[100px] -z-10" />

      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white mb-4">
          Inicia la <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Intervención</span>
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
          className="md:col-span-3 group relative overflow-hidden rounded-2xl bg-[#0c0c12]/90 backdrop-blur-xl border border-emerald-500/20 p-8 hover:border-emerald-500/50 transition-all duration-300"
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
                Para consultas sobre implementación del programa "Beatbox Inclusivo", supervisión de objetivos neuropsicológicos y validación técnica en instituciones.
              </p>
            </div>

            <a 
              href="mailto:jfbermudez@uc.cl"
              className="flex items-center justify-between w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black text-emerald-400 transition-all duration-300 group/btn"
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
          className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c0c12] to-[#050505] border border-white/10 p-8 flex flex-col justify-center items-center text-center hover:border-fuchsia-500/30 transition-all duration-300"
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-gradient-to-r hover:from-fuchsia-600 hover:to-orange-600 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg"
          >
            <span>@beatboxchile_oficial</span> 
          </a>
        </motion.div>

      </div>
    </section>
  );
}