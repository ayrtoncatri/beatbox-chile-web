"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { 
  VideoCameraIcon, 
  CameraIcon, 
  PaintBrushIcon, 
  MicrophoneIcon,
  SparklesIcon 
} from "@heroicons/react/24/solid";

// Datos del Staff Operativo/Creativo
const equipo = [
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
    color: "text-amber-400", // Un toque distinto para el Host/Clown
    bg: "bg-amber-500"
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 }
};

export default function EquipoTrabajo() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 py-16">
      
      {/* Título de Sección */}
      <div className="flex flex-col items-center mb-12 space-y-2">
        <div className="h-1 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />
        <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white/90">
          Staff <span className="text-white/40">Profesional</span>
        </h3>
        <p className="text-white/50 font-medium tracking-wider uppercase text-xs">
          Producción • Audiovisual • Escena
        </p>
      </div>

      {/* Grid de Tarjetas */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {equipo.map((miembro, i) => (
          <motion.div
            key={i}
            variants={item}
            className="group relative bg-[#0c0c12]/60 backdrop-blur-md border border-white/5 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
          >
            {/* Imagen Header */}
            <div className="relative h-48 w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-transparent to-transparent z-10" />
              
              {/* Lógica de Imagen con Fallback */}
              {miembro.image && miembro.image !== "" ? (
                <Image 
                  src={miembro.image} 
                  alt={miembro.nombre}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    // Si falla la carga, ocultamos la imagen rota para que se vea el fondo/fallback si lo hubiera
                    e.currentTarget.style.display = 'none';
                    // Opcional: podrías forzar un estado aquí si quisieras manejarlo más robusto, 
                    // pero para este caso el display none dejará ver el fondo del div.
                  }}
                />
              ) : (
                // Fallback Visual: Silueta cuando no hay foto
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-white/10 group-hover:text-white/20 transition-colors">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* Badge Icono (MANTENIDO) */}
              <div className={`absolute top-3 right-3 z-20 p-2 rounded-lg ${miembro.bg}/20 backdrop-blur-md border border-white/10 text-white`}>
                {miembro.icon}
              </div>
            </div>

            {/* Contenido Textual */}
            <div className="p-5 relative z-20 -mt-6">
              <h4 className="text-lg font-black italic uppercase text-white leading-tight mb-1">
                {miembro.nombre}
              </h4>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${miembro.color}`}>
                {miembro.cargo}
              </p>
              
              <p className="text-xs text-white/60 leading-relaxed mb-4 line-clamp-4 group-hover:line-clamp-none transition-all">
                {miembro.descripcion}
              </p>

              {/* Tags Footer */}
              <div className="flex flex-wrap gap-1.5 border-t border-white/5 pt-3">
                {miembro.tags.map((tag, j) => (
                  <span key={j} className="text-[9px] uppercase font-bold px-2 py-1 bg-white/5 rounded text-white/30 group-hover:text-white/60 transition-colors">
                    #{tag}
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