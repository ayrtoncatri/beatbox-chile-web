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
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* Decoración de fondo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-fuchsia-900/10 blur-[100px] -z-10" />

      {/* Título de Sección */}
      <div className="mb-12 border-b border-cyan-300/25 pb-5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-300"
        >
          <SparklesIcon className="h-4 w-4" aria-hidden="true" />
          <span>
            Dirección institucional
          </span>
        </motion.div>
        
        <h2 className="font-[family-name:var(--font-display)] text-5xl font-bold uppercase italic leading-[0.85] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
          Nuestra directiva
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
          El equipo interdisciplinario que impulsa el beatbox como herramienta de transformación social y competitiva.
        </p>
      </div>

      {/* Grid de Directiva */}
      <motion.div 
        variants={containerVars}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {directiva.map((lider) => (
          <motion.div
            key={lider.nombre}
            variants={cardVars}
            className="group relative h-full"
          >
            <div className="relative flex h-full flex-col items-center gap-5 overflow-hidden border border-cyan-300/30 bg-[#080c13]/95 p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-fuchsia-300/65 hover:shadow-[0_0_28px_rgba(232,121,249,0.14)] [clip-path:polygon(0_14px,14px_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%)]">
              
              {/* Glow Effect on Hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${
                lider.accent === 'blue' ? 'from-blue-900/20' : 
                lider.accent === 'lime' ? 'from-lime-900/20' : 
                'from-fuchsia-900/20'
              } to-transparent pointer-events-none`} />

              {/* Avatar / Imagen */}
              <div className="relative flex-shrink-0">
                <div className={`h-32 w-32 rounded-md p-[2px] bg-gradient-to-br ${
                  lider.accent === 'blue' ? 'from-blue-500 to-transparent' : 
                  lider.accent === 'lime' ? 'from-lime-500 to-transparent' : 
                  'from-fuchsia-500 to-transparent'
                }`}>
                  <div className="relative h-full w-full overflow-hidden rounded-[5px] bg-black">
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
              <div className="relative z-10 flex flex-1 flex-col space-y-3">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase italic leading-none tracking-tight text-white">
                    {lider.nombre}
                  </h3>
                  <p className={`mt-2 text-[9px] font-black uppercase tracking-[0.15em] ${
                    lider.accent === 'blue' ? 'text-blue-400' : 
                    lider.accent === 'lime' ? 'text-lime-400' : 
                    'text-fuchsia-400'
                  }`}>
                    {lider.cargo}
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-white/55">
                  {lider.descripcion}
                </p>

                {/* Tags */}
                <div className="mt-auto flex flex-wrap justify-center gap-1.5 border-t border-white/10 pt-4">
                  {lider.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white/55"
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