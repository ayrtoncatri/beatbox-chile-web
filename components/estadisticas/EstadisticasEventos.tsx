'use client';
import { motion } from 'framer-motion';
import { FaChartBar } from 'react-icons/fa';

// Simula tus datos de eventos
const eventos = [
  { nombre: 'Liga Nacional', año: 2024, participantes: 38, ciudad: 'Santiago', tipo: 'main' },
  { nombre: 'Liga Terapéutica', año: 2024, participantes: 20, ciudad: 'Concepción', tipo: 'side' },
];

export default function EstadisticasEventos() {
  return (
    <section className="mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-fuchsia-300 drop-shadow-lg">
        Estadísticas de Eventos
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        {eventos.map((ev, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              type: 'spring',
              stiffness: 70,
              damping: 18,
              delay: i * 0.13,
            }}
            className="relative group rounded-2xl overflow-hidden
                        bg-gradient-to-br from-purple-900/70 via-violet-800/60 to-fuchsia-400/20
                        backdrop-blur-lg border border-fuchsia-400/20 shadow-2xl
                        hover:shadow-fuchsia-400/40 p-7 flex flex-col gap-3
                        transition-all duration-400 hover:scale-105 hover:border-fuchsia-300/80
                        cursor-pointer"
            style={{ perspective: 600 }}
            whileHover={{ rotateY: -3, rotateX: 3 }}
          >
            <div className="flex items-center gap-2 z-10">
              <FaChartBar className="text-fuchsia-300 text-xl drop-shadow-glow" />
              <h3 className="text-xl font-bold text-white drop-shadow-lg tracking-tight">
                {ev.nombre} {ev.año}
              </h3>
            </div>
            <div className="flex flex-wrap gap-6 text-fuchsia-100 font-medium mt-2">
              <span>👥 {ev.participantes} participantes</span>
              <span>📍 {ev.ciudad}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
