'use client';

import { useEffect, useState } from 'react';

const UNITS = [
  { key: 'days', label: 'DAYS' },
  { key: 'hours', label: 'HOURS' },
  { key: 'mins', label: 'MINS' },
  { key: 'secs', label: 'SECS' },
] as const;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function splitDiff(ms: number) {
  const safe = Math.max(0, ms);
  return {
    days: Math.floor(safe / 86_400_000),
    hours: Math.floor((safe % 86_400_000) / 3_600_000),
    mins: Math.floor((safe % 3_600_000) / 60_000),
    secs: Math.floor((safe % 60_000) / 1_000),
  };
}

export default function EventCountdown({ targetIso }: { targetIso: string }) {
  const target = new Date(targetIso).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = splitDiff(target - (now ?? target));
  const ended = now !== null && now >= target;

  return (
    <div
      className="mx-auto flex w-full max-w-2xl items-center justify-center border border-rose-400/80 bg-black/60 px-2 py-1.5 shadow-[0_0_18px_rgba(244,63,94,0.28)] sm:px-4"
      role="timer"
      aria-live="polite"
      aria-label={ended ? 'El evento ya comenzó' : 'Cuenta regresiva del evento'}
    >
      {ended ? (
        <p className="font-[family-name:var(--font-display)] text-lg font-bold uppercase italic tracking-[0.18em] text-rose-300">
          En curso
        </p>
      ) : (
        <div className="flex w-full items-center justify-between sm:justify-center">
          {UNITS.map((unit, index) => (
            <div key={unit.key} className="flex items-center">
              <div className="flex min-w-[3.4rem] flex-col items-center sm:min-w-[5rem]">
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white sm:text-[10px]">
                  {unit.label}
                </span>
                <span className="evento-count-num text-2xl leading-none sm:text-[2rem]">
                  {now === null ? '--' : pad(parts[unit.key])}
                </span>
              </div>
              {index < UNITS.length - 1 && (
                <span className="mx-0.5 h-7 w-px bg-rose-500/90 sm:mx-2 sm:h-8" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
