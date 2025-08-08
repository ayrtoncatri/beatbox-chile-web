'use client';
import { motion } from 'framer-motion';
import { FaMicrophoneAlt } from 'react-icons/fa';

const eventos = [
  { nombre: 'Liga Nacional 2024', fecha: '2024-09-10', lugar: 'Santiago', tipo: 'main' },
  { nombre: 'Liga Terapéutica 2024', fecha: '2024-06-22', lugar: 'Concepción', tipo: 'side' },
];

export default function EventosList() {
  return (
    <section className="mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-cyan-300 drop-shadow-lg">
        Eventos Pasados
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
            className={`relative group rounded-2xl overflow-hidden
                        bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-cyan-400/20
                        backdrop-blur-lg border border-blue-400/20 shadow-2xl
                        hover:shadow-cyan-400/40 p-7 flex flex-col gap-3
                        transition-all duration-400 hover:scale-105 hover:border-cyan-300/80
                        cursor-pointer`}
            style={{ perspective: 600 }}
            whileHover={{ rotateY: -3, rotateX: 3 }}
          >
            <div className="flex items-center gap-2 z-10">
              <FaMicrophoneAlt className="text-cyan-300 text-xl drop-shadow-glow" />
              <h3 className="text-xl font-bold text-white drop-shadow-lg tracking-tight">
                {ev.nombre}
              </h3>
            </div>
            <p className="text-blue-100 mt-2 font-medium drop-shadow">
              <span className="font-semibold">{ev.fecha}</span> — {ev.lugar}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
