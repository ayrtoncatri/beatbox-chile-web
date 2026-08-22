import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  HeartIcon,
  MicrophoneIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";

type Liga = "competitiva" | "terapeutica";

interface LigasHeroProps {
  active: Liga;
}

const leagues = [
  {
    id: "competitiva" as const,
    label: "Liga competitiva",
    eyebrow: "Circuito nacional",
    tagline: "Demuestra tu nivel. Haz tuyo el escenario.",
    href: "/liga-competitiva",
    cta: "Entrar a la arena",
    image: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1763746159/beatbox-chile-campeonato_xr2nsd.webp",
    icon: TrophyIcon,
  },
  {
    id: "terapeutica" as const,
    label: "Liga terapéutica",
    eyebrow: "Beatbox inclusivo",
    tagline: "Encuentra tu voz. Crece con el ritmo.",
    href: "/liga-terapeutica",
    cta: "Conocer el programa",
    image: "https://res.cloudinary.com/dfd1byvwn/image/upload/v1763744752/new-banner-bbx_ymgg2x.webp",
    icon: HeartIcon,
  },
];

export default function LigasHero({ active }: LigasHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 px-3 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(250,204,21,0.06)_1px,transparent_1px),linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px)] bg-size-[48px_48px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_7px)]" />

      <nav aria-label="Cambiar de liga" className="relative z-10 mx-auto mb-7 flex w-fit items-center rounded-full border border-white/15 bg-[#11151c]/90 p-1.5 shadow-[0_0_26px_rgba(255,255,255,0.08)] backdrop-blur-md">
        {leagues.map((league) => {
          const isActive = league.id === active;
          return (
            <Link
              key={league.id}
              href={league.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-11 items-center rounded-full px-4 text-[10px] font-black uppercase tracking-[0.12em] transition sm:px-6 sm:text-xs ${
                isActive
                  ? league.id === "competitiva"
                    ? "border border-amber-200/70 bg-amber-200/10 text-amber-100 shadow-[0_0_16px_rgba(250,204,21,0.28)]"
                    : "border border-emerald-300/70 bg-emerald-300/10 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.28)]"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {league.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 mx-auto grid max-w-[1450px] gap-4 lg:grid-cols-2">
        {leagues.map((league) => {
          const isActive = league.id === active;
          const Icon = league.icon;
          const isCompetitive = league.id === "competitiva";
          const Heading = isActive ? "h1" : "h2";

          return (
            <article
              key={league.id}
              className={`group relative min-h-[510px] overflow-hidden border bg-black transition duration-300 sm:min-h-[570px] ${
                isCompetitive
                  ? "border-amber-200/55 shadow-[0_0_30px_rgba(250,204,21,0.12)]"
                  : "border-emerald-300/55 shadow-[0_0_30px_rgba(52,211,153,0.12)]"
              } ${isActive ? "order-first opacity-100" : "order-last opacity-80 hover:opacity-100"} lg:order-none [clip-path:polygon(0_16px,16px_0,calc(100%_-_16px)_0,100%_16px,100%_calc(100%_-_16px),calc(100%_-_16px)_100%,16px_100%,0_calc(100%_-_16px))]`}
            >
              <Image
                src={league.image}
                alt=""
                fill
                priority={isActive}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center opacity-75 saturate-125 transition duration-700 group-hover:scale-[1.025]"
              />
              <div className={`absolute inset-0 ${
                isCompetitive
                  ? "bg-[linear-gradient(180deg,rgba(23,16,48,0.08),rgba(12,8,28,0.4)_42%,rgba(5,4,13,0.96)),radial-gradient(circle_at_85%_15%,rgba(217,70,239,0.25),transparent_38%)]"
                  : "bg-[linear-gradient(180deg,rgba(4,34,29,0.1),rgba(3,25,22,0.42)_42%,rgba(2,12,12,0.96)),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.24),transparent_38%)]"
              }`} />

              <div className="pointer-events-none absolute left-6 top-6 h-24 w-24 opacity-65">
                {isCompetitive ? (
                  <>
                    <span className="absolute left-0 top-3 h-px w-full bg-amber-200" />
                    <span className="absolute left-0 top-3 h-16 w-px bg-amber-200" />
                    <span className="absolute left-0 top-[76px] h-px w-14 bg-amber-200" />
                    <MicrophoneIcon className="absolute right-0 top-0 h-10 w-10 text-amber-100" aria-hidden="true" />
                  </>
                ) : (
                  <HeartIcon className="h-16 w-16 text-emerald-200 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]" aria-hidden="true" />
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
                <div className={`mb-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${
                  isCompetitive ? "text-amber-200" : "text-emerald-200"
                }`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {league.eyebrow}
                </div>
                <Heading className="max-w-2xl font-[family-name:var(--font-display)] text-[2.625rem] font-bold uppercase italic leading-[0.8] tracking-[-0.04em] text-white sm:text-7xl lg:text-7xl xl:text-[5rem]">
                  {league.label}
                </Heading>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-white/75 sm:text-sm">
                  {league.tagline}
                </p>
                <Link
                  href={isActive ? (isCompetitive ? "#circuito" : "#programa") : league.href}
                  className={`mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 border px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition focus-visible:outline-2 focus-visible:outline-offset-4 ${
                    isCompetitive
                      ? "border-amber-200/60 bg-amber-100/10 hover:bg-amber-100/20 focus-visible:outline-amber-200"
                      : "border-emerald-300/60 bg-emerald-100/10 hover:bg-emerald-100/20 focus-visible:outline-emerald-200"
                  }`}
                >
                  {league.cta}
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
