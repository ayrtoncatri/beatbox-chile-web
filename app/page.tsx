
import Banner from "@/components/home/Banner";
import Anuncios from "@/components/home/Anuncios";
import NoticiasList from "@/components/home/NoticiasList";
import Historia from "@/components/home/Historia";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio | Beatbox Chile",
  description: "Explora el mundo del beatbox en Chile. Participa en competencias, observa eventos y conoce la historia de la escena beatbox.",
  keywords: ["Beatbox Chile", "cultura beatbox", "competencias", "eventos beatbox", "beatbox", "chile", "Beatbox Santiago de chile", "Beatbox", "Wildcard"],
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-6 px-4">
      <Banner />
      <Anuncios />
      <NoticiasList />
      <Historia />
    </main>
  );
}
