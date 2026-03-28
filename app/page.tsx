import Banner from "@/components/home/Banner";
import Anuncios from "@/components/home/Anuncios";
import NoticiasList from "@/components/home/NoticiasList";
import Historia from "@/components/home/Historia";
import PublicacionesRow from "@/components/publicaciones/PublicacionesRow";
import { prisma } from "@/lib/prisma";
import { PublicationStatus, PublicationType, Publicacion } from "@prisma/client";
import type { Metadata } from "next";

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

async function getHomePublicaciones(): Promise<{
  blogs: Publicacion[];
  noticias: Publicacion[];
}> {
  try {
    const [blogs, noticias] = await Promise.all([
      prisma.publicacion.findMany({
        where: {
          estado: PublicationStatus.publicado,
          tipo: PublicationType.blog,
        },
        orderBy: {
          fecha: "desc",
        },
        take: 5,
      }),
      prisma.publicacion.findMany({
        where: {
          estado: PublicationStatus.publicado,
          tipo: PublicationType.noticia,
        },
        orderBy: {
          fecha: "desc",
        },
        take: 5,
      }),
    ]);

    return { blogs, noticias };
  } catch (error) {
    console.error("Error cargando publicaciones del home:", error);
    return { blogs: [], noticias: [] };
  }
}

export default async function HomePage() {
  const { blogs, noticias } = await getHomePublicaciones();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-6 px-4">
      <Banner />
      <Anuncios />

      <PublicacionesRow title="Blog" tipo="blog" />
      <PublicacionesRow title="Noticias" tipo="noticia" />

      <NoticiasList />
      <Historia />
    </main>
  );
}