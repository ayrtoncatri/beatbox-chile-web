'use client';

import { motion } from 'framer-motion';
import {
  UserIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/solid';
import { GlobalJudgeStatsData } from '@/app/actions/public-data';

interface EstadisticasJuecesProps {
  stats: GlobalJudgeStatsData;
}

export default function EstadisticasJueces({ stats }: EstadisticasJuecesProps) {
  return (
    <section aria-labelledby="panel-jueceo">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Validación competitiva</p>
          <h2 id="panel-jueceo" className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic leading-none text-white sm:text-5xl">
            Panel de jueceo
          </h2>
        </div>
        <div className="hidden items-center gap-2 border border-fuchsia-300/30 bg-fuchsia-300/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-100 sm:flex">
          <CheckBadgeIcon className="h-3.5 w-3.5 text-fuchsia-300" aria-hidden="true" />
          Metodología Validada
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="border border-dashed border-cyan-300/30 bg-cyan-300/5 px-6 py-12 text-center text-sm text-white/60">
          Aún no hay estadísticas de jueces disponibles.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((j, i) => (
            <motion.li
              key={`${j.nombre}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.06 }}
              className="group relative overflow-hidden border border-white/15 bg-[#090c13]/90 p-4 transition duration-300 hover:border-fuchsia-300/60 hover:shadow-[0_0_22px_rgba(232,121,249,0.12)] [clip-path:polygon(0_0,calc(100%_-_12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%_-_12px))]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(232,121,249,0.12),transparent_42%)] opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-fuchsia-300/40 bg-fuchsia-300/5">
                  <UserIcon className="h-7 w-7 text-fuchsia-200/75" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-[family-name:var(--font-display)] text-2xl font-bold uppercase italic leading-none text-white">
                    {j.nombre}
                  </h3>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                    J-{j.nombre.slice(0, 3).toUpperCase()}{i + 1}
                  </p>
                </div>
              </div>

              <div className="relative mt-5 flex items-end justify-between border-t border-white/10 pt-3">
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-white/45">
                  <CalendarDaysIcon className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                  Eventos
                </span>
                <strong className="font-[family-name:var(--font-display)] text-3xl italic leading-none text-white">
                  {j.eventosJuzgados}
                </strong>
              </div>

              <div className="relative mt-3 flex gap-1" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, barIndex) => (
                  <span
                    key={barIndex}
                    className={`h-2 flex-1 ${
                      barIndex < Math.min(j.eventosJuzgados, 8)
                        ? barIndex % 3 === 2 ? 'bg-rose-500' : 'bg-cyan-300'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}