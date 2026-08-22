import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, MoveRight } from "lucide-react";

import { prisma } from "@/lib/prisma";

const FALLBACK_EVENT_IMAGE =
  "https://res.cloudinary.com/dfd1byvwn/image/upload/v1763747284/liga-nacional_zfqux3.webp";

const CARD_ACCENTS = ["home-card-cyan", "home-card-magenta", "home-card-violet"];

export default async function UpcomingEvents() {
  const events = await prisma.evento.findMany({
    where: {
      isPublished: true,
      fecha: { gte: new Date() },
    },
    select: {
      id: true,
      nombre: true,
      fecha: true,
      image: true,
      tipo: { select: { name: true } },
      venue: {
        select: {
          name: true,
          address: { select: { comuna: { select: { name: true } } } },
        },
      },
    },
    orderBy: { fecha: "asc" },
    take: 3,
  });

  return (
    <section aria-labelledby="upcoming-events-title" className="relative overflow-hidden border-y border-cyan-300/15 px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_90%_100%,rgba(232,121,249,0.12),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="home-kicker">Agenda activa</p>
            <h2 id="upcoming-events-title" className="home-title mt-2 text-5xl text-white sm:text-6xl">Próximos eventos</h2>
          </div>
          <Link href="/eventos" className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-200 transition hover:text-white">
            Ver agenda <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {events.map((event, index) => {
              const date = new Intl.DateTimeFormat("es-CL", {
                day: "2-digit",
                month: "short",
              }).format(event.fecha).replace(".", "");
              const location = [event.venue?.name, event.venue?.address?.comuna?.name]
                .filter(Boolean)
                .join(", ");

              return (
                <Link key={event.id} href={`/eventos/${event.id}`} className={`home-card ${CARD_ACCENTS[index % CARD_ACCENTS.length]} group relative isolate min-h-72`}>
                  <Image
                    src={event.image || FALLBACK_EVENT_IMAGE}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="-z-10 object-cover opacity-55 transition duration-500 group-hover:scale-105 group-hover:opacity-70"
                  />
                  <div className="absolute inset-0 -z-10 bg-linear-to-t from-[#090b16] via-[#090b16]/55 to-[#090b16]/10" />
                  <div className="flex h-full min-h-72 flex-col justify-between p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="border border-fuchsia-300/40 bg-black/40 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-fuchsia-100">
                        {event.tipo?.name || "Beatbox Chile"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-cyan-100"><CalendarDays className="h-4 w-4" />{date}</span>
                    </div>
                    <div>
                      <h3 className="home-title max-w-sm text-4xl text-white transition group-hover:text-cyan-200">{event.nombre}</h3>
                      {location && <p className="mt-3 flex items-center gap-2 text-sm text-white/75"><MapPin className="h-4 w-4 text-fuchsia-300" />{location}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="home-card home-card-cyan px-5 py-8 text-sm text-cyan-50/80">
            La próxima fecha del circuito será anunciada pronto.
          </div>
        )}
      </div>
    </section>
  );
}
