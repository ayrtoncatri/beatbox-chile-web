'use client';

import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  MicrophoneIcon,
  TrophyIcon,
  UsersIcon,
} from '@heroicons/react/24/solid';
import { GlobalEventStatsData } from '@/app/actions/public-data';

interface EstadisticasEventosProps {
  stats: GlobalEventStatsData;
}

export default function EstadisticasEventos({ stats }: EstadisticasEventosProps) {
  const maxValue = Math.max(stats.totalEventos, stats.totalParticipantes, 1);
  const activity = [
    {
      label: 'Eventos registrados',
      value: stats.totalEventos,
      width: `${Math.max((stats.totalEventos / maxValue) * 100, 12)}%`,
      icon: CalendarDaysIcon,
      color: 'from-fuchsia-500 to-rose-400',
    },
    {
      label: 'Participantes',
      value: stats.totalParticipantes,
      width: `${Math.max((stats.totalParticipantes / maxValue) * 100, 12)}%`,
      icon: UsersIcon,
      color: 'from-violet-500 to-cyan-300',
    },
  ];

  return (
    <section aria-labelledby="metricas-globales">
      <div className="grid gap-4 lg:grid-cols-[1.04fr_1fr]">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden border border-fuchsia-400/40 bg-[#12091b]/80 p-5 shadow-[inset_0_0_32px_rgba(168,85,247,0.08),0_0_24px_rgba(217,70,239,0.08)] sm:p-7 [clip-path:polygon(0_14px,14px_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(192,132,252,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(192,132,252,0.055)_1px,transparent_1px)] bg-size-[32px_32px]" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-300">Participación de la comunidad</p>
            <h2 id="metricas-globales" className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic leading-none text-white sm:text-4xl">
              Métricas globales
            </h2>

            <div className="mt-8 space-y-7">
              {activity.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-end justify-between gap-4">
                      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/60">
                        <Icon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                        {item.label}
                      </span>
                      <strong className="font-[family-name:var(--font-display)] text-3xl italic leading-none text-white">
                        {item.value}
                      </strong>
                    </div>
                    <div className="h-3 overflow-hidden border border-white/10 bg-black/45 p-0.5">
                      <div
                        className={`h-full bg-linear-to-r ${item.color} shadow-[0_0_12px_rgba(34,211,238,0.5)]`}
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="group relative flex min-h-72 overflow-hidden border border-cyan-300/45 bg-[#07131a]/90 shadow-[inset_0_0_42px_rgba(6,182,212,0.08),0_0_28px_rgba(34,211,238,0.08)] [clip-path:polygon(14px_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%,0_14px)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_42%,rgba(34,211,238,0.24),transparent_24%),radial-gradient(circle_at_78%_54%,rgba(244,63,94,0.22),transparent_37%)]" />
          <div className="pointer-events-none absolute right-[10%] top-1/2 h-44 w-44 -translate-y-1/2 rounded-full border border-cyan-300/40 shadow-[0_0_25px_rgba(34,211,238,0.35),inset_0_0_25px_rgba(244,63,94,0.2)] sm:h-52 sm:w-52" />
          <MicrophoneIcon className="pointer-events-none absolute bottom-[-12px] right-[13%] h-56 w-56 rotate-[-8deg] text-white/10 drop-shadow-[0_0_14px_rgba(34,211,238,0.5)] sm:h-64 sm:w-64" aria-hidden="true" />

          <div className="relative z-10 flex max-w-[68%] flex-col justify-center p-6 sm:p-8">
            <span className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Campeón vigente</span>
            <TrophyIcon className="mb-4 h-8 w-8 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" aria-hidden="true" />
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic leading-[0.85] text-white sm:text-5xl lg:text-6xl">
              {stats.ultimoGanadorCN || 'Sin registro'}
            </h2>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/55">
              Campeón nacional más reciente
            </p>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-2/3 bg-linear-to-r from-rose-500 via-fuchsia-400 to-transparent" />
        </motion.article>
      </div>
    </section>
  );
}