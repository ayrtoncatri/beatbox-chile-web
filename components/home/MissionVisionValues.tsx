"use client";
import { motion } from "framer-motion";
import { Target, Eye, ShieldCheck, Zap, Users, Trophy } from "lucide-react";

const valores = [
  { icon: Trophy, text: "Excelencia Competitiva" },
  { icon: Users, text: "Comunidad y Respeto" },
  { icon: ShieldCheck, text: "Justicia y Transparencia" },
  { icon: Zap, text: "Evolución Artística" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function MissionVisionValues() {
  return (
    <section className="w-full bg-[#0a0a0c] py-24 px-4 relative overflow-hidden">
      
      {/* Fondo Texturizado Técnico */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Encabezado */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-5 py-1.5 rounded-sm border-l-4 border-[#00F0FF] bg-zinc-900 mb-6 shadow-md">
            <span className="text-zinc-300 font-bold tracking-[0.3em] uppercase text-[11px]">
              Fundamentos Institucionales
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">
            El Motor del <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
               Beatbox Chileno
            </span>
          </h2>
        </motion.div>

        {/* GRILLA DE TARJETAS (Asimétricas con Título Izquierdo) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          
          {/* Tarjeta 1: MISIÓN */}
          <motion.div variants={itemVariants} className="flex flex-row bg-[#0f0f12] border border-zinc-700/50 rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.6)] group">
            {/* Lado Izquierdo: Título Vertical */}
            <div className="w-16 md:w-20 bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center border-r border-zinc-700 relative overflow-hidden shrink-0">
               <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,white_2px,white_4px)]"></div>
               <h3 className="text-zinc-300 group-hover:text-[#00F0FF] transition-colors font-black italic uppercase tracking-[0.3em] text-xl md:text-2xl transform rotate-180 [writing-mode:vertical-rl] z-10">
                 Nuestra Misión
               </h3>
            </div>
            {/* Lado Derecho: Contenido */}
            <div className="p-6 md:p-8 flex-1 flex flex-col relative bg-gradient-to-br from-transparent to-black/40">
               <div className="w-12 h-12 bg-zinc-900 border border-zinc-600 rounded-lg flex items-center justify-center mb-4 group-hover:border-[#00F0FF]/50 transition-colors shadow-inner">
                 <Target className="w-6 h-6 text-zinc-400 group-hover:text-[#00F0FF]" />
               </div>
               <p className="text-zinc-400 leading-relaxed text-sm md:text-base font-medium">
                 Fomentar, desarrollar y profesionalizar el arte del beatbox en Chile. Brindamos una plataforma estructurada y justa para todos los artistas, elevando el nivel nacional mediante competencias oficiales, talleres formativos y un sólido apoyo a nuestra comunidad.
               </p>
            </div>
          </motion.div>

          {/* Tarjeta 2: VISIÓN */}
          <motion.div variants={itemVariants} className="flex flex-row bg-[#0f0f12] border border-zinc-700/50 rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.6)] group">
            {/* Lado Izquierdo: Título Vertical */}
            <div className="w-16 md:w-20 bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center border-r border-zinc-700 relative overflow-hidden shrink-0">
               <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,white_2px,white_4px)]"></div>
               <h3 className="text-zinc-300 group-hover:text-[#FF0055] transition-colors font-black italic uppercase tracking-[0.3em] text-xl md:text-2xl transform rotate-180 [writing-mode:vertical-rl] z-10">
                 Nuestra Visión
               </h3>
            </div>
            {/* Lado Derecho: Contenido */}
            <div className="p-6 md:p-8 flex-1 flex flex-col relative bg-gradient-to-br from-transparent to-black/40">
               <div className="w-12 h-12 bg-zinc-900 border border-zinc-600 rounded-lg flex items-center justify-center mb-4 group-hover:border-[#FF0055]/50 transition-colors shadow-inner">
                 <Eye className="w-6 h-6 text-zinc-400 group-hover:text-[#FF0055]" />
               </div>
               <p className="text-zinc-400 leading-relaxed text-sm md:text-base font-medium">
                 Convertir a Chile en un referente mundial en la disciplina del beatbox. Buscamos consolidar una industria sostenible donde los exponentes puedan desarrollarse profesionalmente y representar al país en las máximas instancias internacionales.
               </p>
            </div>
          </motion.div>

          {/* Tarjeta 3: VALORES (Ocupa ancho completo en LG) */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row bg-[#0f0f12] border border-zinc-700/50 rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.6)] lg:col-span-2 group">
             {/* Lado Superior/Izquierdo: Título */}
             <div className="w-full md:w-20 h-16 md:h-auto bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center border-b md:border-b-0 md:border-r border-zinc-700 relative overflow-hidden shrink-0">
               <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,white_2px,white_4px)]"></div>
               {/* Texto Horizontal en Mobile, Vertical en Desktop */}
               <h3 className="text-zinc-300 font-black italic uppercase tracking-[0.3em] text-lg md:text-2xl md:transform md:rotate-180 md:[writing-mode:vertical-rl] z-10">
                 Valores
               </h3>
            </div>
            {/* Contenido (Grilla de 4 valores) */}
            <div className="p-6 md:p-8 flex-1 bg-gradient-to-br from-transparent to-black/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {valores.map((valor, index) => (
                <div key={index} className="flex items-center gap-4 bg-black/60 p-4 rounded-xl border border-zinc-700/50 hover:border-zinc-400 transition-colors shadow-inner">
                  <div className="bg-zinc-800 p-2.5 rounded-lg border border-zinc-600">
                    <valor.icon className="w-5 h-5 text-zinc-300" />
                  </div>
                  <span className="text-zinc-200 font-black italic uppercase text-sm tracking-widest">{valor.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}