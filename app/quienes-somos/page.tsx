import Directiva from "@/components/quienes-somos/Directiva";
import EquipoTrabajo from "@/components/quienes-somos/EquipoTrabajo";
import Contacto from "@/components/quienes-somos/Contacto";
import BuzonIdeas from "@/components/quienes-somos/BuzonIdeas";
import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDaysIcon, MusicalNoteIcon, UserGroupIcon } from "@heroicons/react/24/solid";

export const metadata: Metadata = {
  title: "Quiénes Somos | Beatbox Chile",
  description: "Conoce la directiva, el equipo de trabajo y la historia de Beatbox Chile. Contáctanos o envía tus ideas a nuestra comunidad.",
  keywords: ["Beatbox Chile", "equipo", "directiva", "quiénes somos", "comunidad", "contacto", "ideas"],
};

export default function QuienesSomosPage() {
  const wave = [8, 13, 22, 36, 18, 42, 66, 28, 48, 22, 54, 82, 38, 62, 30, 18, 44, 70, 34, 52, 24, 14, 9];

  return (
    <main className="relative min-h-screen overflow-clip bg-[#020409] text-white selection:bg-fuchsia-400/30 selection:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.055)_1px,transparent_1px),linear-gradient(rgba(232,121,249,0.04)_1px,transparent_1px)] bg-size-[48px_48px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.11] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.07)_0,rgba(255,255,255,0.07)_1px,transparent_1px,transparent_7px)]" />

      <section className="relative isolate min-h-[760px] overflow-hidden border-b border-cyan-300/20 pt-24 sm:min-h-[820px] sm:pt-28">
        <Image
          src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763744752/new-banner-bbx_ymgg2x.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-55 saturate-125"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,4,9,0.2),rgba(2,4,9,0.72)_58%,rgba(2,4,9,0.96)),linear-gradient(180deg,rgba(2,4,9,0.1),rgba(2,4,9,0.28)_55%,#020409)]" />
        <div className="absolute -left-32 top-16 h-[520px] w-[520px] rounded-full bg-fuchsia-600/25 blur-[130px]" />
        <div className="absolute right-0 top-20 h-[480px] w-[480px] rounded-full bg-cyan-500/15 blur-[130px]" />

        <div className="pointer-events-none absolute left-4 top-32 h-20 w-20 border-l-2 border-t-2 border-fuchsia-300/75 sm:left-8" />
        <div className="pointer-events-none absolute right-4 top-32 h-20 w-20 border-r-2 border-t-2 border-cyan-300/75 sm:right-8" />

        <div className="relative z-10 mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <header className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 border border-cyan-300/45 bg-black/35 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100 backdrop-blur-sm">
              <MusicalNoteIcon className="h-4 w-4 text-fuchsia-300" aria-hidden="true" />
              Quiénes somos
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-[4.25rem] font-bold uppercase italic leading-[0.76] tracking-[-0.045em] text-white drop-shadow-[4px_0_0_rgba(34,211,238,0.45),-4px_0_0_rgba(232,121,249,0.4)] sm:text-8xl lg:text-[8rem]">
              Somos
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-cyan-200 via-white to-fuchsia-300">
                ritmo
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-sm font-black uppercase tracking-[0.18em] text-white/80 sm:text-base">
              Beatbox Chile — comunidad, cultura y movimiento
            </p>

            <div className="mt-9 flex h-20 max-w-xl items-center gap-1" aria-hidden="true">
              {wave.map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className={`min-w-0 flex-1 rounded-full ${
                    index < wave.length / 2
                      ? "bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.75)]"
                      : "bg-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.75)]"
                  }`}
                  style={{ height }}
                />
              ))}
            </div>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold uppercase italic tracking-[0.08em] text-white/75">
              El sonido de Chile
            </p>
          </header>

          <div className="grid gap-4">
            <article className="relative ml-auto max-w-lg border border-cyan-300/45 bg-[#071117]/90 p-6 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-md [clip-path:polygon(0_14px,14px_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%)] sm:p-7">
              <CalendarDaysIcon className="mb-4 h-7 w-7 text-cyan-300" aria-hidden="true" />
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic leading-none text-cyan-100">
                Raíces del movimiento
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Desde 2007, la escena nacional ha crecido desde encuentros urbanos hasta campeonatos oficiales que conectan generaciones de beatboxers.
              </p>
            </article>

            <article className="relative max-w-lg border border-fuchsia-300/45 bg-[#130817]/90 p-6 shadow-[0_0_30px_rgba(232,121,249,0.12)] backdrop-blur-md [clip-path:polygon(14px_0,100%_0,100%_100%,0_100%,0_14px)] sm:p-7 lg:-ml-8">
              <UserGroupIcon className="mb-4 h-7 w-7 text-fuchsia-300" aria-hidden="true" />
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase italic leading-none text-fuchsia-100">
                Evolución y comunidad
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Competencias, formación y colaboración sostienen una plataforma que profesionaliza el arte y amplifica las voces de todo Chile.
              </p>
            </article>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <Directiva />
        <EquipoTrabajo />
        <Contacto />
        <BuzonIdeas />
      </div>
    </main>
  );
}
