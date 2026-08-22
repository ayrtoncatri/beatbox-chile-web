"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { 
  VideoCameraIcon, 
  CameraIcon, 
  PaintBrushIcon, 
  MicrophoneIcon,
  CodeBracketIcon, 
  CpuChipIcon 
} from "@heroicons/react/24/solid";

const equipo = [
  {
    nombre: "Ayrton Catri",
    cargo: "Desarrollador Web Beatbox Chile",
    descripcion: "Arquitecto de la infraestructura digital de Beatbox Chile. Responsable de la implementación de nuevas funcionalidades, optimización de la plataforma y escalabilidad del ecosistema web para la comunidad.",
    tags: ["Fullstack", "NextJS", "UI/UX"],
    icon: <CodeBracketIcon className="w-5 h-5" />,
    image: "",
    color: "text-red-500",
    bg: "bg-red-500"
  },
  {
    nombre: "Alexander Pizarro",
    cargo: "Desarrollador Web Beatbox Chile",
    descripcion: "Especialista en desarrollo front-end y experiencia de usuario. Trabaja en la integración de datos y en asegurar que la plataforma sea una herramienta eficiente tanto para competidores como para el staff.",
    tags: ["Frontend", "React", "Web App"],
    icon: <CpuChipIcon className="w-5 h-5" />,
    image: "",
    color: "text-blue-500",
    bg: "bg-blue-500"
  },
  {
    nombre: "Benjamín Ascencio Donoso",
    cargo: "Diseñador Gráfico Independiente",
    descripcion: "Creativo visual enfocado en la estética urbana y competitiva. Colabora en la creación de piezas gráficas de alto impacto que definen la cara visual de los torneos y actividades oficiales.",
    tags: ["Arte Digital", "Ilustración", "Layout"],
    icon: <PaintBrushIcon className="w-5 h-5" />,
    image: "",
    color: "text-purple-500",
    bg: "bg-purple-500"
  },
  // --- STAFF ORIGINAL ---
  {
    nombre: "Simón Yáñez Huaracán",
    cargo: "Director Equipo Audiovisual",
    descripcion: "Lidera el registro, edición y diseño visual. Coordina transmisiones de torneos virtuales. Experiencia en Bonsai Films, cortometrajes y eventos masivos.",
    tags: ["Filmmaker", "Streaming", "Edición"],
    icon: <VideoCameraIcon className="w-5 h-5" />,
    image: "",
    color: "text-blue-400",
    bg: "bg-blue-500"
  },
  {
    nombre: "Camila Acevedo Villalobos",
    cargo: "Fotógrafa Equipo Audiovisual",
    descripcion: "Comunicadora audiovisual (Duoc UC). Experiencia en Canal 13 (asistente de dirección) y productoras de videoclips. Fotógrafa profesional experta en escena.",
    tags: ["Fotografía", "Dirección", "TV"],
    icon: <CameraIcon className="w-5 h-5" />,
    image: "",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500"
  },
  {
    nombre: "Luis Veas Núñez",
    cargo: "Encargado de Imagen Corporativa",
    descripcion: "Diseñador guardián de la identidad visual de Beatbox Chile. Supervisa la coherencia gráfica en actividades internas y difusión externa.",
    tags: ["Branding", "Diseño Gráfico", "Identidad"],
    icon: <PaintBrushIcon className="w-5 h-5" />,
    image: "",
    color: "text-lime-400",
    bg: "bg-lime-500"
  },
  {
    nombre: "Juan José Cantillano",
    cargo: "Host & Beatboxer Clown",
    descripcion: "Actor (La Mancha) y Beatboxer. Host de la Liga Competitiva y Clown en la Terapéutica. Une arte escénico, humor y cultura Hip Hop.",
    tags: ["Host", "Clown", "Actor"],
    icon: <MicrophoneIcon className="w-5 h-5" />,
    image: "",
    color: "text-amber-400",
    bg: "bg-amber-500"
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function EquipoTrabajo() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      
      <header className="mb-12 border-b border-fuchsia-300/25 pb-5">
        <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
          </span>
          Crew 2026
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-5xl font-bold uppercase italic leading-[0.85] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
          Nuestro equipo
        </h2>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
          Producción • Tecnología • Creatividad
        </p>
      </header>

      {/* Grid de Tarjetas */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {equipo.map((miembro) => (
          <motion.div
            key={miembro.nombre}
            variants={item}
            className="group relative overflow-hidden border border-fuchsia-300/25 bg-[#090b12]/95 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-[0_0_26px_rgba(34,211,238,0.12)] [clip-path:polygon(0_0,calc(100%_-_14px)_0,100%_14px,100%_100%,14px_100%,0_calc(100%_-_14px))]"
          >
            {/* Círculo de luz de fondo (Hover) */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 ${miembro.bg} opacity-0 group-hover:opacity-10 blur-[50px] transition-opacity duration-500`} />

            {/* Header: Imagen con Máscara */}
            <div className="relative h-48 w-full overflow-hidden p-3">
              <div className="relative h-full w-full overflow-hidden border border-white/10 bg-white/[0.03]">
                {miembro.image ? (
                  <Image 
                    src={miembro.image} 
                    alt={miembro.nombre}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className={`absolute inset-0 bg-gradient-to-b ${miembro.bg}/20 to-transparent`} />
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-28 w-28 text-white/8 transition-colors group-hover:text-white/15" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Badge Icono */}
                <div className={`absolute bottom-3 right-3 z-20 border border-white/15 bg-black/70 p-2.5 backdrop-blur-md ${miembro.color}`}>
                  {miembro.icon}
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex min-h-72 flex-col px-5 pb-5">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase italic leading-none text-white transition-colors group-hover:text-cyan-100">
                {miembro.nombre}
              </h3>
              <p className={`mb-4 mt-2 text-[9px] font-black uppercase tracking-[0.16em] ${miembro.color}`}>
                {miembro.cargo}
              </p>
              
              <p className="mb-6 text-xs font-medium leading-relaxed text-white/55">
                {miembro.descripcion}
              </p>

              {/* Tags con Estilo Capsule */}
              <div className="mt-auto flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
                {miembro.tags.map((tag) => (
                  <span key={tag} className="border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white/50 transition group-hover:text-white/75">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}