import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PublicationStatus, PublicationType } from "@prisma/client";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatFecha(fecha: Date | string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(fecha));
}

export default async function PublicacionDetailPage({ params }: Props) {
  const { id } = await params;

  const pub = await prisma.publicacion.findFirst({
    where: {
      id,
      estado: PublicationStatus.publicado,
    },
  });

  if (!pub) return notFound();

  const fechaFormateada = formatFecha(pub.fecha);
  const imagenPrincipal = pub.imagenes?.[0] ?? null;
  const imagenesSecundarias = pub.imagenes?.slice(1) ?? [];
  const isNoticia = pub.tipo === PublicationType.noticia;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 px-4 py-10">
      <article className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <span
            className={`inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
              isNoticia
                ? "bg-red-500/15 text-red-200 border border-red-400/30"
                : "bg-cyan-500/15 text-cyan-200 border border-cyan-400/30"
            }`}
          >
            {pub.tipo}
          </span>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-wide text-white sm:text-4xl lg:text-5xl">
            {pub.titulo}
          </h1>

          <div className="mt-4 flex flex-col gap-2 text-sm text-blue-100/80 sm:flex-row sm:items-center sm:gap-6">
            <span>
              <strong className="text-white">Autor:</strong> {pub.autor}
            </span>
            <span>
              <strong className="text-white">Fecha:</strong> {fechaFormateada}
            </span>
          </div>
        </header>

        {imagenPrincipal && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-blue-700/20 bg-black/30 shadow-xl">
            <img
              src={imagenPrincipal}
              alt={pub.titulo}
              className={`w-full object-cover ${
                isNoticia ? "h-64 sm:h-80 lg:h-[420px]" : "h-60 sm:h-72 lg:h-[380px]"
              }`}
            />
          </div>
        )}

        <section className="rounded-2xl border border-blue-700/20 bg-blue-950/30 p-6 shadow-lg w-full">
          <div className="mb-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-white/90">
              {isNoticia ? "Contenido de la noticia" : "Contenido del blog"}
            </h2>
          </div>

          <div className="whitespace-pre-line text-base leading-8 text-blue-50/90 sm:text-lg">
            {pub.descripcion || "Sin contenido disponible."}
          </div>

          {pub.url && (
            <div className="mt-6">
              <a
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
              >
                Ver enlace relacionado
              </a>
            </div>
          )}
        </section>

        {imagenesSecundarias.length > 0 && (
          <section className="mt-10">
            <h3 className="mb-4 text-xl font-black uppercase tracking-wide text-white">
              Galería
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imagenesSecundarias.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className="overflow-hidden rounded-2xl border border-blue-700/20 bg-black/30"
                >
                  <img
                    src={img}
                    alt={`${pub.titulo} ${index + 2}`}
                    className="h-56 w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}