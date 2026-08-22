import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  ArrowLeftIcon,
  MapPinIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  TrophyIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/solid';
import type { RoundPhase } from '@prisma/client';
import EventCountdown from '@/components/eventos/EventCountdown';
import FormularioWildcard from '@/components/wildcards/FormularioWildcard';
import CompraTicketsForm from '@/components/compra-entradas/CompraTicketsForm';

const FALLBACK_IMAGE =
  'https://res.cloudinary.com/dfd1byvwn/image/upload/v1763746159/beatbox-chile-campeonato_xr2nsd.webp';

const PHASE_COPY: Record<RoundPhase, { title: string; icon: 'mic' | 'disc' | 'trophy' | 'video' }> = {
  WILDCARD: { title: 'WILDCARDS', icon: 'video' },
  PRELIMINAR: { title: 'ELIMINATORIAS', icon: 'disc' },
  OCTAVOS: { title: 'OCTAVOS', icon: 'mic' },
  CUARTOS: { title: 'CUARTOS', icon: 'mic' },
  SEMIFINAL: { title: 'SEMIFINAL', icon: 'mic' },
  TERCER_LUGAR: { title: '3ER LUGAR', icon: 'trophy' },
  FINAL: { title: 'FINAL', icon: 'trophy' },
};

const PHASE_ORDER: RoundPhase[] = [
  'WILDCARD',
  'PRELIMINAR',
  'OCTAVOS',
  'CUARTOS',
  'SEMIFINAL',
  'TERCER_LUGAR',
  'FINAL',
];

type TicketType = {
  id: string;
  name: string;
  price: number;
  capacity: number | null;
};

type JudgeCard = {
  id: string;
  name: string;
  image: string | null;
  tag: string;
  subtitle: string;
};

type TimelineItem = {
  id: string;
  title: string;
  meta: string;
  accent: 'cyan' | 'rose';
  icon: 'mic' | 'disc' | 'trophy' | 'video';
};

export type EventoLandingProps = {
  evento: {
    id: string;
    nombre: string;
    fecha: Date;
    descripcion: string | null;
    reglas: string;
    image: string | null;
    isTicketed: boolean;
    wildcardDeadline: Date | null;
    sponsors: string | null;
    tipoName: string | null;
    ticketTypes: TicketType[];
    venue: {
      name: string;
      street: string | null;
      comuna: string | null;
      region: string | null;
      lat: number | null;
      lng: number | null;
    } | null;
    judges: JudgeCard[];
    phases: RoundPhase[];
    hasBattles: boolean;
    hasWildcards: boolean;
  };
};

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Santiago',
  })
    .format(date)
    .replace('.', '')
    .toUpperCase();
}

function formatEventTime(date: Date) {
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Santiago',
  }).format(date);
}

function IconFor({ name }: { name: TimelineItem['icon'] }) {
  const className = 'h-4 w-4 shrink-0';
  if (name === 'video') return <VideoCameraIcon className={className} aria-hidden="true" />;
  if (name === 'trophy') return <TrophyIcon className={className} aria-hidden="true" />;
  if (name === 'disc') return <MusicalNoteIcon className={className} aria-hidden="true" />;
  return <MicrophoneIcon className={className} aria-hidden="true" />;
}

function buildTimeline(evento: EventoLandingProps['evento']): TimelineItem[] {
  const items: TimelineItem[] = [];
  const eventMeta = `${formatEventDate(evento.fecha)} · ${formatEventTime(evento.fecha)}`;

  const phases = [...new Set(evento.phases)]
    .sort((a, b) => PHASE_ORDER.indexOf(a) - PHASE_ORDER.indexOf(b))
    .filter((phase) => phase !== 'WILDCARD');

  if (phases.length >= 2) {
    phases.slice(0, 3).forEach((phase, index, list) => {
      const copy = PHASE_COPY[phase];
      items.push({
        id: phase,
        title: copy.title,
        meta: eventMeta,
        accent: index === list.length - 1 ? 'rose' : 'cyan',
        icon: copy.icon,
      });
    });
    return items;
  }

  if (evento.wildcardDeadline) {
    items.push({
      id: 'wildcard',
      title: 'WILDCARDS',
      meta: `CIERRE · ${formatEventDate(evento.wildcardDeadline)} · ${formatEventTime(evento.wildcardDeadline)}`,
      accent: 'cyan',
      icon: 'video',
    });
  }

  items.push({
    id: 'evento',
    title: (evento.tipoName || 'EVENTO').toUpperCase(),
    meta: eventMeta,
    accent: evento.hasBattles ? 'cyan' : 'rose',
    icon: 'mic',
  });

  if (evento.hasBattles) {
    items.push({
      id: 'bracket',
      title: 'BRACKET',
      meta: 'SEGUIMIENTO EN VIVO',
      accent: 'rose',
      icon: 'trophy',
    });
  }

  return items.slice(0, 3);
}

function mapsQuery(evento: EventoLandingProps['evento']) {
  if (!evento.venue) return '';
  if (evento.venue.lat != null && evento.venue.lng != null) {
    return `${evento.venue.lat},${evento.venue.lng}`;
  }
  return [evento.venue.name, evento.venue.street, evento.venue.comuna, evento.venue.region, 'Chile']
    .filter(Boolean)
    .join(', ');
}

function ElectricSpark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="52" stroke="#22d3ee" strokeWidth="2" opacity="0.9" />
      <path
        d="M78 18 L84 8 L90 20 L102 14 L96 28"
        stroke="#67e8f9"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M104 62 L116 58 L110 72 L118 80"
        stroke="#22d3ee"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M28 96 L18 108 L32 104 L24 118"
        stroke="#67e8f9"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EventoLanding({ evento }: EventoLandingProps) {
  const fecha = evento.fecha;
  const esEventoPasado = fecha.getTime() < Date.now();
  const deadline = evento.wildcardDeadline;
  const wildcardAbierta = Boolean(deadline && deadline.getTime() > Date.now());
  const isTicketed = evento.isTicketed && evento.ticketTypes.length > 0 && !esEventoPasado;
  const timeline = buildTimeline(evento);
  const query = mapsQuery(evento);
  const directionsUrl = query
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
    : null;
  const embedUrl = query
    ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=es`
    : null;
  const locationLine = [evento.venue?.comuna, evento.venue?.region ? undefined : 'Chile']
    .filter(Boolean)
    .join(', ');
  const cityLine = [evento.venue?.comuna, 'Chile'].filter(Boolean).join(', ');

  const primaryCta = isTicketed
    ? { href: '#entradas', label: 'Get tickets' }
    : wildcardAbierta
      ? { href: '#wildcard', label: 'Enviar wildcard' }
      : esEventoPasado
        ? null
        : { href: '#info', label: 'Ver información' };

  return (
    <div className="evento-stage min-h-screen overflow-hidden pb-20 selection:bg-rose-500/30 selection:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(244,63,94,0.045)_1px,transparent_1px),linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px)] bg-size-[52px_52px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_8px)]" />
      <div className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[280px] bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_62%)]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[280px] bg-[radial-gradient(circle,rgba(34,211,238,0.08),transparent_62%)]" />

      <section className="relative isolate overflow-hidden pt-20 sm:pt-24">
        <div className="absolute inset-x-0 top-0 h-[280px] sm:h-[340px]">
          <Image
            src={evento.image || FALLBACK_IMAGE}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-top opacity-45 saturate-125"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,0.15),rgba(5,5,6,0.72)_58%,#050506)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,63,94,0.18),transparent_42%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-start justify-between gap-4 sm:mb-4">
            <Link
              href="/eventos"
              className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/70 transition hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              Eventos
            </Link>

            {evento.venue && (
              <aside className="max-w-[14rem] border border-white/15 bg-black/55 px-3 py-2 text-right shadow-[0_0_18px_rgba(0,0,0,0.45)] sm:max-w-xs">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-300">
                  Venue: {evento.venue.name}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/85">
                  {cityLine}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">
                  {formatEventDate(fecha)}
                </p>
              </aside>
            )}
          </div>

          <div className="mx-auto max-w-5xl text-center">
            {evento.tipoName && (
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">
                {evento.tipoName}
              </p>
            )}
            <h1 className="evento-title mx-auto max-w-6xl text-[clamp(1.7rem,4.5vw,3.55rem)]">
              {evento.nombre}
            </h1>

            <div className="mt-4">
              <EventCountdown targetIso={fecha.toISOString()} />
            </div>

            <div className="mt-4">
              {primaryCta ? (
                <a href={primaryCta.href} className="evento-cta">
                  {primaryCta.label}
                </a>
              ) : (
                <span className="evento-cta cursor-default opacity-60">Evento finalizado</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-6 grid max-w-7xl gap-8 px-4 pb-6 sm:px-6 lg:mt-8 lg:grid-cols-[0.9fr_1.15fr] lg:gap-10 lg:px-8">
        <ol className="relative space-y-3 pl-8 sm:pl-10">
          <span
            className="absolute bottom-3 left-[11px] top-3 w-px bg-linear-to-b from-cyan-300 via-cyan-300 to-rose-500 sm:left-[15px]"
            aria-hidden="true"
          />
          {timeline.map((item) => {
            const isRose = item.accent === 'rose';
            return (
              <li key={item.id} className="relative">
                <span
                  className={`absolute -left-8 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full sm:-left-10 ${
                    isRose
                      ? 'bg-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.95)]'
                      : 'bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.95)]'
                  }`}
                  aria-hidden="true"
                />
                <div
                  className={`evento-skew border bg-black/70 px-4 py-2.5 sm:px-5 ${
                    isRose
                      ? 'border-rose-400/80 shadow-[0_0_16px_rgba(244,63,94,0.28)]'
                      : 'border-cyan-300/80 shadow-[0_0_16px_rgba(34,211,238,0.28)]'
                  }`}
                >
                  <div className="evento-unskew flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`font-[family-name:var(--font-display)] text-xl font-bold uppercase italic leading-none sm:text-2xl ${
                          isRose ? 'text-rose-200' : 'text-cyan-100'
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                        {item.meta}
                      </p>
                    </div>
                    <span className={isRose ? 'text-rose-300' : 'text-cyan-300'}>
                      <IconFor name={item.icon} />
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="space-y-5">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic leading-none text-white sm:text-5xl">
              Judges
            </h2>
            {evento.judges.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-6">
                {evento.judges.slice(0, 4).map((judge) => (
                  <li key={judge.id} className="flex w-[6.5rem] flex-col items-center text-center sm:w-32">
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                      <ElectricSpark className="pointer-events-none absolute -inset-3" />
                      <div className="evento-ring relative h-full w-full overflow-hidden rounded-full bg-[#0a0e1c]">
                        <Image
                          src={
                            judge.image ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(judge.name)}&background=0a0e1c&color=22d3ee&bold=true`
                          }
                          alt=""
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold uppercase italic leading-none text-white">
                      {judge.name}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">
                      {judge.subtitle}
                    </p>
                    <span className="mt-2 border border-cyan-300/70 bg-cyan-300/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100">
                      {judge.tag}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 border border-dashed border-cyan-300/25 bg-cyan-300/5 px-4 py-6 text-sm text-white/55">
                Panel de jueces por confirmar.
              </p>
            )}
          </div>

          {evento.venue && (
            <div className="relative overflow-hidden border border-white/10 bg-[#08090d]">
              {embedUrl ? (
                <iframe
                  title={`Mapa de ${evento.venue.name}`}
                  src={embedUrl}
                  className="h-36 w-full grayscale invert contrast-125"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex h-36 items-center justify-center bg-[#0c1018]">
                  <MapPinIcon className="h-10 w-10 text-rose-400" aria-hidden="true" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,0.15),transparent_30%,rgba(5,5,6,0.2))]" />
              <MapPinIcon
                className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-10 text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,1)]"
                aria-hidden="true"
              />
              <div className="absolute left-3 top-3 border border-white/15 bg-black/75 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-300">
                  {evento.venue.name}
                </p>
                <p className="text-[10px] font-bold uppercase text-white/70">
                  {evento.venue.street || locationLine}
                </p>
                <p className="text-[10px] font-bold uppercase text-white/60">{formatEventDate(fecha)}</p>
              </div>
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 left-1/2 inline-flex min-h-10 -translate-x-1/2 items-center border-2 border-rose-400 bg-black/80 px-5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_0_16px_rgba(244,63,94,0.55)] transition hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-300"
                >
                  Directions
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <nav
        aria-label="Secciones del evento"
        className="relative z-10 mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-8 text-[11px] font-black uppercase tracking-[0.16em] text-white sm:gap-x-6 sm:text-xs"
      >
        <Link href="/quienes-somos" className="min-h-11 inline-flex items-center hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
          Contact
        </Link>
        <span className="hidden h-4 w-px bg-rose-500 sm:block" aria-hidden="true" />
        {evento.reglas.trim() ? (
          <>
            <a href="#reglas" className="min-h-11 inline-flex items-center hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
              Rules
            </a>
            <span className="hidden h-4 w-px bg-rose-500 sm:block" aria-hidden="true" />
          </>
        ) : null}
        {evento.sponsors?.trim() ? (
          <>
            <a href="#sponsors" className="min-h-11 inline-flex items-center hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
              Sponsors
            </a>
            <span className="hidden h-4 w-px bg-rose-500 sm:block" aria-hidden="true" />
          </>
        ) : null}
        <Link href="/" className="min-h-11 inline-flex items-center hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
          beatboxchile.com
        </Link>
      </nav>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
        <div className="space-y-10 lg:col-span-7">
          {evento.descripcion && (
            <section id="info" className="scroll-mt-28">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic text-white">
                Información
              </h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-white/75">{evento.descripcion}</p>
            </section>
          )}

          {evento.reglas.trim() && (
            <section id="reglas" className="scroll-mt-28 border border-cyan-300/20 bg-black/40 p-6">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic text-white">
                Rules
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">{evento.reglas}</p>
            </section>
          )}

          {evento.sponsors?.trim() && (
            <section id="sponsors" className="scroll-mt-28">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-4xl font-bold uppercase italic text-white">
                Sponsors
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">{evento.sponsors}</p>
            </section>
          )}

          {evento.hasBattles && (
            <Link
              href={`/eventos/${evento.id}/bracket`}
              className="group flex min-h-14 items-center justify-between border border-cyan-300/40 bg-black/50 px-5 py-4 transition hover:border-rose-400/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              <span className="flex items-center gap-3">
                <TrophyIcon className="h-5 w-5 text-rose-400" aria-hidden="true" />
                <span>
                  <span className="block font-[family-name:var(--font-display)] text-2xl font-bold uppercase italic leading-none text-white">
                    Ver brackets
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
                    Seguimiento en vivo
                  </span>
                </span>
              </span>
              <span className="text-cyan-200 transition group-hover:translate-x-1">→</span>
            </Link>
          )}

          {evento.hasWildcards && (
            <Link
              href={`/eventos/${evento.id}/wildcards`}
              className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              Ver galería de wildcards
            </Link>
          )}
        </div>

        <aside className="space-y-6 lg:col-span-5">
          <div id="entradas" className="scroll-mt-28 border border-white/10 bg-black/50 p-5">
            {esEventoPasado ? (
              <div className="py-8 text-center">
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic text-white/70">
                  Evento finalizado
                </h2>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">Venta cerrada</p>
              </div>
            ) : isTicketed ? (
              <>
                <h2 className="mb-4 font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic text-white">
                  Entradas
                </h2>
                <Suspense fallback={<p className="text-sm text-white/50">Cargando entradas...</p>}>
                  <CompraTicketsForm eventoId={evento.id} ticketTypes={evento.ticketTypes} />
                </Suspense>
              </>
            ) : (
              <div className="py-8 text-center">
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic text-white/70">
                  Venta no disponible
                </h2>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">
                  Próximamente más información sobre entradas.
                </p>
              </div>
            )}
          </div>

          <div id="wildcard" className="scroll-mt-28 border border-white/10 bg-black/50 p-5">
            {wildcardAbierta && deadline ? (
              <>
                <div className="mb-4 text-center">
                  <p className="inline-flex items-center gap-2 border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-200">
                    Inscripciones abiertas
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic text-white">
                    Sube tu wildcard
                  </h2>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
                    Cierra {formatEventDate(deadline)} · {formatEventTime(deadline)}
                  </p>
                </div>
                <Suspense fallback={<p className="text-sm text-white/50">Cargando formulario...</p>}>
                  <FormularioWildcard eventoId={evento.id} />
                </Suspense>
              </>
            ) : deadline ? (
              <div className="py-8 text-center">
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic text-amber-200">
                  Inscripciones cerradas
                </h2>
                <p className="mt-1 text-xs text-white/50">El plazo para enviar videos ha finalizado.</p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase italic text-white/50">
                  Wildcard no disponible
                </h2>
                <p className="mt-1 text-xs text-white/40">Clasificación online deshabilitada.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
