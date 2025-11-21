"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { 
  UserGroupIcon, 
  GlobeAmericasIcon, 
  HeartIcon, 
  SparklesIcon, 
  AcademicCapIcon 
} from "@heroicons/react/24/solid";

// Datos extraídos del PDF "BEATBOX INCLUSIVO" [cite: 18-33]
const directiva = [
  {
    nombre: "Andrés Chung Sutter",
    cargo: "CEO & Gestor Cultural",
    descripcion: "Lidera la estrategia global y gestión de recursos. Ingeniero Civil y Beatboxer con 15 años de trayectoria en la escena nacional.",
    tags: ["Gestión", "Finanzas", "Liderazgo"],
    icon: <UserGroupIcon className="w-5 h-5" />,
    image: "", // Asegúrate de tener estas fotos o usa un placeholder
    accent: "fuchsia" // Color principal
  },
  {
    nombre: "Walter Sierra Vega",
    cargo: "CEO & Relaciones Internacionales",
    descripcion: "Campeón Panamericano 2022 e Ingeniero en Computación. Encargado de las alianzas globales y la infraestructura tecnológica de torneos.",
    tags: ["RR.II", "Tech", "Streaming"],
    icon: <GlobeAmericasIcon className="w-5 h-5" />,
    image: "",
    accent: "blue" // Color Competitiva
  },
  {
    nombre: "Javiera Bermúdez Rojas",
    cargo: "Directora Liga Terapéutica",
    descripcion: "Neuropsicóloga en formación con 15 años de experiencia en arte y salud mental. Supervisa las intervenciones clínicas y educativas.",
    tags: ["Salud Mental", "Neuropsicología", "Inclusión"],
    icon: <HeartIcon className="w-5 h-5" />,
    image: "",
    accent: "lime" // Color Terapéutica/Salud
  },
  {
    nombre: "Fabián Díaz Molina",
    cargo: "Educador Liga Competitiva",
    descripcion: "Asesor pedagógico experto en fonoaudiología y psicología deportiva. Enfocado en la especialización técnica de los beatboxers.",
    tags: ["Educación", "Fonoaudiología", "Técnica"],
    icon: <AcademicCapIcon className="w-5 h-5" />,
    image: "",
    accent: "fuchsia"
  },
];

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVars: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
};

export default function Directiva() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
      {/* Decoración de fondo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-fuchsia-900/10 blur-[100px] -z-10" />

      {/* Título de Sección */}
      <div className="text-center mb-16 space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-900/20 backdrop-blur-md"
        >
          <SparklesIcon className="w-4 h-4 text-fuchsia-400" />
          <span className="text-xs font-black italic tracking-widest text-fuchsia-300 uppercase">
            High Command
          </span>
        </motion.div>
        
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-xl">
          Directiva <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-blue-500">Beatbox Chile</span>
        </h2>
        <p className="max-w-2xl mx-auto text-white/60 text-lg font-light">
          El equipo interdisciplinario que impulsa el beatbox como herramienta de transformación social y competitiva[cite: 14].
        </p>
      </div>

      {/* Grid de Directiva */}
      <motion.div 
        variants={containerVars}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {directiva.map((lider, i) => (
          <motion.div
            key={i}
            variants={cardVars}
            className="group relative h-full"
          >
            <div className="relative h-full bg-[#0c0c12]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden p-6 hover:border-white/10 transition-colors duration-300 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              
              {/* Glow Effect on Hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${
                lider.accent === 'blue' ? 'from-blue-900/20' : 
                lider.accent === 'lime' ? 'from-lime-900/20' : 
                'from-fuchsia-900/20'
              } to-transparent pointer-events-none`} />

              {/* Avatar / Imagen */}
              <div className="relative flex-shrink-0">
                <div className={`w-24 h-24 rounded-full p-[2px] bg-gradient-to-br ${
                  lider.accent === 'blue' ? 'from-blue-500 to-transparent' : 
                  lider.accent === 'lime' ? 'from-lime-500 to-transparent' : 
                  'from-fuchsia-500 to-transparent'
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                    {/* Lógica: Si hay imagen intenta cargarla, si falla o no hay, muestra icono */}
                    {lider.image && lider.image !== "" ? (
                      <Image 
                        src={lider.image} 
                        alt={lider.nombre}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        onError={(e) => {
                          // Si la imagen falla al cargar (404), se oculta para dejar ver el fondo/icono si hubiera
                          e.currentTarget.style.display = 'none'; 
                          // Opcional: Forzar renderizado del fallback visual si fuera necesario mediante estado
                        }}
                      />
                    ) : (
                      // FALLBACK: Icono de usuario elegante cuando no hay foto
                      <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20 group-hover:text-white/40 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                {/* Icono Flotante */}
                <div className="absolute -bottom-1 -right-1 bg-[#1a1a24] p-1.5 rounded-full border border-white/10 text-white">
                  {lider.icon}
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 space-y-3 relative z-10">
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">
                    {lider.nombre}
                  </h3>
                  <p className={`text-sm font-bold uppercase tracking-wider ${
                    lider.accent === 'blue' ? 'text-blue-400' : 
                    lider.accent === 'lime' ? 'text-lime-400' : 
                    'text-fuchsia-400'
                  }`}>
                    {lider.cargo}
                  </p>
                </div>

                <p className="text-sm text-white/50 leading-relaxed">
                  {lider.descripcion}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                  {lider.tags.map((tag, j) => (
                    <span 
                      key={j}
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/5 border border-white/5 text-white/40 group-hover:border-white/10 group-hover:text-white/70 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}