'use client';
import { motion, Variants } from 'framer-motion';
import { UserCircleIcon, TrophyIcon, StarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { PublicCompetitorListData } from '@/app/actions/public-data';

interface CompetidoresListProps {
  competitors: PublicCompetitorListData;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: 'spring', stiffness: 60, damping: 15 } 
  }
};

export default function CompetidoresList({ competitors }: CompetidoresListProps) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl">
      <div className="mb-7 border-b border-white/10 pb-4 sm:mb-9">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-300">
          Competidores destacados
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic leading-none text-white sm:text-5xl">
          Muro de la Fama
        </h2>
      </div>

      {competitors.length === 0 ? (
        <div className="border border-dashed border-fuchsia-300/30 bg-fuchsia-300/5 px-6 py-12 text-center text-sm text-white/60">
          Aún no hay competidores disponibles en el archivo.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {competitors.map((c, i) => (
            <motion.li
              key={c.id}
              variants={itemVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/historial-competitivo/competidores/${c.id}`}
                className="group relative flex h-full min-h-64 flex-col items-center overflow-hidden rounded-2xl border border-cyan-300/45 bg-[#0a0d16]/90 px-5 pb-5 pt-6 text-center shadow-[0_0_22px_rgba(34,211,238,0.1)] transition duration-300 hover:-translate-y-1 hover:border-fuchsia-300/70 hover:shadow-[0_0_28px_rgba(232,121,249,0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_80%_80%,rgba(232,121,249,0.08),transparent_32%)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-200 to-transparent" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-cyan-300 via-violet-400 to-fuchsia-400 p-0.5 shadow-[0_0_24px_rgba(34,211,238,0.28),0_0_22px_rgba(232,121,249,0.2)]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b0e17]">
                    <UserCircleIcon className="h-20 w-20 text-white/55 transition-colors group-hover:text-white/75" aria-hidden="true" />
                  </div>

                  {c.destacado && (
                    <span className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-amber-200/60 bg-amber-300 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.32)]">
                      <TrophyIcon className="h-3 w-3" aria-hidden="true" />
                      Legend
                    </span>
                  )}
                </div>

                <div className="relative mt-6 min-w-0">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase italic leading-none text-white transition-colors group-hover:text-cyan-100">
                    {c.nombre}
                  </h3>
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-wide text-white/55">
                    {c.destacado && (
                      <StarIcon className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                    )}
                    {c.logros}
                  </p>
                </div>

                <div className="relative mt-auto h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-full bg-linear-to-r from-fuchsia-400 via-violet-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.55)]" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}