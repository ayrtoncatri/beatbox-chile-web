'use client';

import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  TrophyIcon,
  StarIcon,
  MicrophoneIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import { GlobalCompetitorStatsData } from '@/app/actions/public-data';
import { useState } from 'react';

interface EstadisticasCompetidorProps {
  stats: GlobalCompetitorStatsData;
}

const ITEMS_PER_PAGE = 4;

export default function EstadisticasCompetidor({ stats }: EstadisticasCompetidorProps) {
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <section aria-labelledby="top-performers">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-rose-400">Ranking por desempeño</p>
          <h2 id="top-performers" className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic leading-none text-white sm:text-5xl">
            Top performers
          </h2>
        </div>
        <div className="hidden items-center gap-2 border border-cyan-300/30 bg-cyan-300/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          Datos oficiales
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="border border-dashed border-fuchsia-300/30 bg-fuchsia-300/5 px-6 py-12 text-center text-sm text-white/60">
          Aún no hay estadísticas de competidores disponibles.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.slice(0, visibleItems).map((c, i) => {
            const ratingPercent = Math.min(Math.max((c.notaPromedio / 10) * 100, 0), 100);
            const accent = i % 2 === 0 ? 'cyan' : 'rose';

            return (
              <motion.li
                key={`${c.nombre}-${i}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % ITEMS_PER_PAGE) * 0.06 }}
                className={`group relative min-w-0 overflow-hidden border bg-[#0a0d14]/95 p-4 transition duration-300 [clip-path:polygon(0_12px,12px_0,100%_0,100%_calc(100%_-_12px),calc(100%_-_12px)_100%,0_100%)] ${
                  accent === 'cyan'
                    ? 'border-cyan-300/35 hover:border-cyan-300/70 hover:shadow-[0_0_24px_rgba(34,211,238,0.14)]'
                    : 'border-rose-400/35 hover:border-rose-400/70 hover:shadow-[0_0_24px_rgba(244,63,94,0.14)]'
                }`}
              >
                <div className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                  accent === 'cyan'
                    ? 'bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.12),transparent_40%)]'
                    : 'bg-[radial-gradient(circle_at_15%_20%,rgba(244,63,94,0.12),transparent_40%)]'
                }`} />

                <div className="relative flex items-start gap-3">
                  <div className={`relative flex h-16 w-14 shrink-0 items-center justify-center border bg-black/40 ${
                    accent === 'cyan' ? 'border-cyan-300/45' : 'border-rose-400/45'
                  }`}>
                    <UserCircleIcon className="h-12 w-12 text-white/55" aria-hidden="true" />
                    <span className="absolute -left-px -top-px bg-white px-1.5 py-0.5 text-[9px] font-black text-black">#{i + 1}</span>
                  </div>

                  <div className="min-w-0 pt-1">
                    <h3 className="truncate font-[family-name:var(--font-display)] text-2xl font-bold uppercase italic leading-none text-white">
                      {c.nombre}
                    </h3>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                      Competidor nacional
                    </p>
                    {i < 3 && (
                      <span className="mt-2 inline-flex items-center gap-1 bg-amber-300 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-black">
                        <TrophyIcon className="h-2.5 w-2.5" aria-hidden="true" />
                        Top
                      </span>
                    )}
                  </div>
                </div>

                <dl className="relative mt-4 grid grid-cols-3 gap-1.5 border-t border-white/10 pt-3">
                  <div>
                    <dt className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wide text-white/40">
                      <TrophyIcon className="h-3 w-3 text-amber-300" aria-hidden="true" />
                      Podios
                    </dt>
                    <dd className="mt-1 font-mono text-base font-black text-white">{c.victorias}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wide text-white/40">
                      <StarIcon className="h-3 w-3 text-cyan-300" aria-hidden="true" />
                      Nota
                    </dt>
                    <dd className="mt-1 font-mono text-base font-black text-white">{c.notaPromedio.toFixed(1)}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wide text-white/40">
                      <MicrophoneIcon className="h-3 w-3 text-fuchsia-300" aria-hidden="true" />
                      Batallas
                    </dt>
                    <dd className="mt-1 font-mono text-base font-black text-white">{c.participaciones}</dd>
                  </div>
                </dl>

                <div className="relative mt-3 h-1.5 overflow-hidden bg-white/10" aria-label={`Nota promedio: ${c.notaPromedio.toFixed(1)} de 10`}>
                  <div
                    className="h-full bg-linear-to-r from-rose-500 via-fuchsia-400 to-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.55)]"
                    style={{ width: `${ratingPercent}%` }}
                  />
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      {visibleItems < stats.length && (
        <div className="mt-7 flex justify-center">
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={handleLoadMore}
            className="inline-flex min-h-11 items-center gap-2 border border-cyan-300/50 bg-cyan-300/10 px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-300/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
          >
            <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            Ver más competidores
          </motion.button>
        </div>
      )}
    </section>
  );
}