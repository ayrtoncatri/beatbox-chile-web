import Banner from "@/components/home/Banner";
import Anuncios from "@/components/home/Anuncios";
import NoticiasList from "@/components/home/NoticiasList";
import Historia from "@/components/home/Historia";
import PublicacionesRow from "@/components/publicaciones/PublicacionesRow";
import type { Metadata } from "next";
import UpcomingEvents from "@/components/home/UpcomingEvents";

export const metadata: Metadata = {
  title: "Inicio | Beatbox Chile",
  description:
    "Explora el mundo del beatbox en Chile. Participa en competencias, observa eventos y conoce la historia de la escena beatbox.",
  keywords: [
    "Beatbox Chile",
    "cultura beatbox",
    "competencias",
    "eventos beatbox",
    "beatbox",
    "chile",
    "Beatbox Santiago de chile",
    "Beatbox",
    "Wildcard",
  ],
};

export default function HomePage() {
  return (
    <main className="home-stage min-h-screen overflow-x-hidden text-white">
      <div className="relative mx-auto max-w-[1600px] border-x border-white/5 bg-[#070915]">
        <div className="home-spray -left-24 top-10 h-80 w-80 bg-cyan-400/20" />
        <div className="home-spray right-0 top-[420px] h-96 w-96 bg-fuchsia-500/18" />
        <div className="home-spray bottom-[20%] left-1/3 h-72 w-72 bg-violet-500/16" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.045)_1px,transparent_1px),linear-gradient(rgba(244,114,182,0.03)_1px,transparent_1px)] bg-size-[48px_48px] mix-blend-screen" />

        <div className="relative">
          <Banner />
          <UpcomingEvents />
          <Anuncios />

          <div className="border-y border-fuchsia-300/15 bg-[#05060d]/80 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="home-kicker">Desde la comunidad</p>
              <h2 className="home-title mt-2 text-5xl text-white sm:text-6xl md:text-7xl">
                Últimas <span className="text-fuchsia-300">publicaciones</span>
              </h2>
            </div>
            <PublicacionesRow title="Blog" tipo="blog" />
            <PublicacionesRow title="Noticias" tipo="noticia" />
          </div>

          <NoticiasList />
          <Historia />
        </div>
      </div>
    </main>
  );
}
