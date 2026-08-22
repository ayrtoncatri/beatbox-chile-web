import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Suspense } from 'react';
import Image from 'next/image';
import {
  CalendarDaysIcon,
  MapPinIcon,
  MicrophoneIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';

export const revalidate = 60;

async function getEventosPublicados() {
  const eventos = await prisma.evento.findMany({
    where: {
      isPublished: true,
    },
    include: {
      tipo: true,
      venue: {
        include: {
          address: {
            include: {
              comuna: true,
            },
          },
        },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  });
  return eventos;
}

type EventoPublico = Awaited<ReturnType<typeof getEventosPublicados>>[number];

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: 'short',
  timeZone: 'America/Santiago',
});

const monthFormatter = new Intl.DateTimeFormat('es-CL', {
  month: 'short',
  timeZone: 'America/Santiago',
});

function EventoCard({ evento }: { evento: EventoPublico }) {
  const fechaEvento = new Date(evento.fecha);
  const esEventoPasado = fechaEvento < new Date();
  const [day, month] = dateFormatter
    .format(fechaEvento)
    .replace('.', '')
    .toUpperCase()
    .split(' ');
  const location = [evento.venue?.name, evento.venue?.address?.comuna?.name]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={`/eventos/${evento.id}`}
      className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
    >
      <article
        className={`relative grid overflow-hidden rounded-2xl border bg-[#0a0d16]/92 shadow-[0_0_24px_rgba(34,211,238,0.08)] backdrop-blur-md transition duration-300 group-hover:-translate-y-0.5 group-hover:border-fuchsia-300/65 group-hover:shadow-[0_0_30px_rgba(232,121,249,0.16)] sm:grid-cols-[105px_220px_1fr] ${
          esEventoPasado ? 'border-white/15' : 'border-cyan-300/45'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(34,211,238,0.06),transparent_36%,rgba(232,121,249,0.07))]" />

        <div className="relative flex items-center justify-between border-b border-white/10 bg-black/30 px-5 py-4 sm:flex-col sm:justify-center sm:border-b-0 sm:border-r sm:px-3 sm:py-6">
          <span className="font-[family-name:var(--font-display)] text-5xl font-bold italic leading-none text-white drop-shadow-[2px_0_0_rgba(232,121,249,0.45)] sm:text-6xl">
            {day}
          </span>
          <span className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic leading-none text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.55)] sm:mt-1">
            {month}
          </span>
        </div>

        <div className="relative min-h-44 overflow-hidden sm:min-h-52">
          <Image
            src={evento.image || 'https://res.cloudinary.com/dfd1byvwn/image/upload/v1763747284/liga-nacional_zfqux3.webp'}
            alt={evento.nombre}
            fill
            sizes="(min-width: 640px) 220px, 100vw"
            className={`object-cover transition duration-500 group-hover:scale-105 ${
              esEventoPasado ? 'opacity-65 saturate-50' : 'opacity-85'
            }`}
          />
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-[#0a0d16]/60 sm:block" />
          <div className="absolute inset-0 bg-linear-to-t from-[#0a0d16]/75 via-transparent to-transparent sm:hidden" />
        </div>

        <div className="relative flex min-w-0 flex-col justify-center p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-cyan-100">
              <MicrophoneIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {evento.tipo?.name || 'Evento'}
            </span>
            {esEventoPasado && (
              <span className="rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-amber-200">
                Finalizado
              </span>
            )}
          </div>

          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic leading-[0.9] text-white transition-colors group-hover:text-cyan-100 sm:text-4xl">
            {evento.nombre}
          </h2>

          {location && (
            <p className="mt-3 flex min-w-0 items-center gap-2 text-sm text-white/60">
              <MapPinIcon className="h-4 w-4 shrink-0 text-fuchsia-300" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </p>
          )}

          <span className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 border border-cyan-300/45 bg-black/30 px-4 text-xs font-black uppercase tracking-[0.14em] text-white transition group-hover:border-fuchsia-300/70 group-hover:text-cyan-100">
            Ver evento
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function EventosListPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03050b] text-white selection:bg-cyan-400/30 selection:text-cyan-50">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.055)_1px,transparent_1px),linear-gradient(rgba(232,121,249,0.04)_1px,transparent_1px)] bg-size-[52px_52px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.055)_0,rgba(255,255,255,0.055)_1px,transparent_1px,transparent_7px)]" />
      <div className="pointer-events-none absolute -left-52 top-0 h-[620px] w-[620px] rounded-full bg-cyan-500/14 blur-[140px]" />
      <div className="pointer-events-none absolute -right-52 top-20 h-[620px] w-[620px] rounded-full bg-fuchsia-500/14 blur-[140px]" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-32 text-center sm:px-6 sm:pb-14 sm:pt-36 lg:px-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-[#09101a]/80 px-4 py-1.5 shadow-[0_0_18px_rgba(34,211,238,0.16)]">
          <CalendarDaysIcon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
          <span className="text-[11px] font-black uppercase italic tracking-[0.2em] text-cyan-100">
            Agenda oficial
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-6xl font-bold uppercase italic leading-[0.85] tracking-[-0.04em] text-white drop-shadow-[3px_0_0_rgba(34,211,238,0.55),-3px_0_0_rgba(232,121,249,0.45)] sm:text-8xl lg:text-[7.5rem]">
          Próximos Eventos
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-mono text-sm text-white/60 sm:text-base">
          {"// Fechas, competencias y encuentros de la escena nacional."}
        </p>
      </section>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingSpinner />}>
          <ListaDeEventos />
        </Suspense>
      </div>
    </main>
  );
}

async function ListaDeEventos() {
  const eventos = await getEventosPublicados();

  if (eventos.length === 0) {
    return (
      <div className="mx-auto max-w-4xl border border-dashed border-cyan-300/30 bg-cyan-300/5 px-6 py-14 text-center">
        <CalendarDaysIcon className="mx-auto h-8 w-8 text-cyan-300" aria-hidden="true" />
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic text-white">
          Agenda en preparación
        </h2>
        <p className="mt-2 text-sm text-white/60">
          No hay eventos publicados por el momento.
        </p>
      </div>
    );
  }

  const months = Array.from(
    new Set(
      eventos.map((evento) =>
        monthFormatter
          .format(new Date(evento.fecha))
          .replace('.', '')
          .toUpperCase()
      )
    )
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[130px_1fr] lg:gap-10">
      <aside className="lg:sticky lg:top-28 lg:h-fit" aria-label="Meses del calendario">
        <div className="flex items-center gap-3 overflow-x-auto pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
          <p className="mr-2 shrink-0 font-[family-name:var(--font-display)] text-2xl font-bold uppercase italic tracking-[0.14em] text-cyan-200 lg:mb-3 lg:mr-0 lg:[writing-mode:vertical-rl] lg:rotate-180 lg:text-4xl">
            Timeline
          </p>
          <div className="hidden h-8 w-px bg-linear-to-b from-cyan-300 to-fuchsia-400 lg:block" />
          {months.map((month, index) => (
            <div key={month} className="flex shrink-0 items-center lg:flex-col">
              <span
                className={`flex h-12 min-w-12 items-center justify-center rounded-full border bg-[#09101a] px-3 font-mono text-xs font-black uppercase tracking-wide ${
                  index === 0
                    ? 'border-cyan-200 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.3)]'
                    : 'border-white/20 text-white/60'
                }`}
              >
                {month}
              </span>
              {index < months.length - 1 && (
                <span className="mx-2 h-px w-5 bg-cyan-300/35 lg:mx-0 lg:h-7 lg:w-px" />
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="space-y-5">
        {eventos.map((evento) => (
          <EventoCard key={evento.id} evento={evento} />
        ))}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
    </div>
  );
}