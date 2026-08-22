'use client';
import { motion, Variants } from 'framer-motion';
import { CalendarIcon, MapPinIcon, TrophyIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { PublicEventListData } from '@/app/actions/public-data';

interface EventosListProps {
  events: PublicEventListData;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const accents = [
  'border-cyan-300/55 shadow-[0_0_24px_rgba(34,211,238,0.12)] hover:border-fuchsia-300/75 hover:shadow-[0_0_30px_rgba(232,121,249,0.2)]',
  'border-fuchsia-300/55 shadow-[0_0_24px_rgba(232,121,249,0.12)] hover:border-cyan-300/75 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]',
];

export default function EventosList({ events }: EventosListProps) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl">
      <div className="mb-7 flex items-end justify-between gap-4 border-b border-white/10 pb-4 sm:mb-9">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Registro oficial
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic leading-none text-white sm:text-5xl">
            Eventos Archivados
          </h2>
        </div>
        <span className="hidden font-mono text-xs uppercase tracking-widest text-white/40 sm:block">
          {events.length} registros
        </span>
      </div>

      {events.length === 0 ? (
        <div className="border border-dashed border-cyan-300/30 bg-cyan-300/5 px-6 py-12 text-center text-sm text-white/60">
          Aún no hay eventos publicados en el archivo competitivo.
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {events.map((ev, i) => (
            <Link
              href={`/historial-competitivo/eventos/${ev.id}`}
              key={ev.id}
              className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              <motion.article
                variants={item}
                className={`relative h-full overflow-hidden rounded-2xl border bg-[#0a0d16]/90 p-5 backdrop-blur-md transition duration-300 sm:p-6 ${accents[i % accents.length]}`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(34,211,238,0.08),transparent_38%,rgba(232,121,249,0.08))] opacity-70" />
                <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-r border-t border-fuchsia-300/35" />

                <div className="relative flex items-center gap-4 sm:gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-amber-300/45 bg-[radial-gradient(circle,#fbbf24_0%,#78350f_68%,#111827_70%)] shadow-[0_0_20px_rgba(251,191,36,0.18)] sm:h-20 sm:w-20">
                    <TrophyIcon className="h-8 w-8 text-amber-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.65)] sm:h-10 sm:w-10" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase italic leading-[0.95] text-white transition-colors group-hover:text-cyan-100 sm:text-3xl">
                      {ev.nombre}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/60">
                      <span className="flex items-center gap-1.5 font-mono uppercase tracking-wide text-cyan-200">
                        <CalendarIcon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                        {new Intl.DateTimeFormat('es-CL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          timeZone: 'America/Santiago',
                        }).format(new Date(ev.fecha))}
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-fuchsia-300" aria-hidden="true" />
                        <span className="truncate">{ev.venue.name}</span>
                      </span>
                    </div>

                    <span className="mt-4 inline-flex rounded-full border border-cyan-300/45 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.12)]">
                      Final Nacional
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </motion.div>
      )}
    </section>
  );
}