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
    <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
      
      {/* Título de Sección con Estilo mejorado */}
      <div className="flex flex-col items-center mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Crew 2026</span>
        </div>
        <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-4">
          Staff <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Profesional</span>
        </h3>
        <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">
          Producción • Tecnología • Creatividad
        </p>
      </div>

      {/* Grid de Tarjetas */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {equipo.map((miembro, i) => (
          <motion.div
            key={i}
            variants={item}
            className="group relative bg-[#0c0c12]/40 backdrop-blur-xl border border-white/5 hover:border-white/20 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2"
          >
            {/* Círculo de luz de fondo (Hover) */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 ${miembro.bg} opacity-0 group-hover:opacity-10 blur-[50px] transition-opacity duration-500`} />

            {/* Header: Imagen con Máscara */}
            <div className="relative h-56 w-full overflow-hidden p-4">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5">
                {miembro.image ? (
                  <Image 
                    src={miembro.image} 
                    alt={miembro.nombre}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className={`absolute inset-0 bg-gradient-to-b ${miembro.bg}/20 to-transparent`} />
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-white/5 group-hover:text-white/10 transition-colors">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Badge Icono */}
                <div className={`absolute bottom-3 right-3 z-20 p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 ${miembro.color}`}>
                  {miembro.icon}
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="px-6 pb-8">
              <h4 className="text-xl font-black italic uppercase text-white leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                {miembro.nombre}
              </h4>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${miembro.color}`}>
                {miembro.cargo}
              </p>
              
              <p className="text-[13px] text-gray-400 leading-relaxed mb-6 font-medium">
                {miembro.descripcion}
              </p>

              {/* Tags con Estilo Capsule */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                {miembro.tags.map((tag, j) => (
                  <span key={j} className="text-[9px] uppercase font-black px-2.5 py-1 bg-white/5 rounded-full text-gray-500 group-hover:text-white group-hover:bg-white/10 transition-all">
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