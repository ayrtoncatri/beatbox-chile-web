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
    <section className="relative w-full overflow-hidden px-4 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,114,182,0.04)_1px,transparent_1px)] bg-size-[32px_32px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <p className="home-kicker">Fundamentos institucionales</p>
          <h2 className="home-title mt-3 text-5xl text-white md:text-6xl lg:text-7xl">
            El motor del <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-fuchsia-300">beatbox chileno</span>
          </h2>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          <motion.div variants={itemVariants} className="home-card home-card-cyan group p-6 md:p-7">
            <div className="mb-5 flex h-12 w-12 items-center justify-center border border-cyan-300/40 bg-black/40">
              <Target className="h-6 w-6 text-cyan-300" />
            </div>
            <h3 className="home-title text-4xl text-cyan-200">Nuestra Misión</h3>
            <p className="mt-4 text-sm font-medium leading-relaxed text-white/70 md:text-base">
              Fomentar, desarrollar y profesionalizar el arte del beatbox en Chile. Brindamos una plataforma estructurada y justa para todos los artistas, elevando el nivel nacional mediante competencias oficiales, talleres formativos y un sólido apoyo a nuestra comunidad.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="home-card home-card-magenta group p-6 md:p-7">
            <div className="mb-5 flex h-12 w-12 items-center justify-center border border-fuchsia-300/40 bg-black/40">
              <Eye className="h-6 w-6 text-fuchsia-300" />
            </div>
            <h3 className="home-title text-4xl text-fuchsia-200">Nuestra Visión</h3>
            <p className="mt-4 text-sm font-medium leading-relaxed text-white/70 md:text-base">
              Convertir a Chile en un referente mundial en la disciplina del beatbox. Buscamos consolidar una industria sostenible donde los exponentes puedan desarrollarse profesionalmente y representar al país en las máximas instancias internacionales.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="home-card home-card-violet group p-6 md:p-7">
            <h3 className="home-title mb-5 text-4xl text-violet-200">Valores</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {valores.map((valor, index) => (
                <div key={index} className="flex items-center gap-3 border border-white/10 bg-black/40 p-3 transition-colors hover:border-violet-300/50">
                  <div className="border border-white/15 bg-zinc-900 p-2">
                    <valor.icon className="h-5 w-5 text-violet-200" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-white">{valor.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
