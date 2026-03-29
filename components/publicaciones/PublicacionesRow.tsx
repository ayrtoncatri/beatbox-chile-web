"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

type Publicacion = {
  id: string;
  titulo: string;
  imagenes: string[];
};

type Props = {
  title: string;
  tipo: "blog" | "noticia";
};

const PAGE_SIZE = 5;

export default function PublicacionesRow({ title, tipo }: Props) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const fetchData = async (newPage: number) => {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/publicaciones?tipo=${tipo}&page=${newPage}&pageSize=${PAGE_SIZE}`
      );

      const json = await res.json();

      setItems(json.data);
      setHasNext(json.pagination.hasNextPage);
    } catch {
      setItems([]);
      setHasNext(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page, tipo]);

  const goNext = () => {
    if (hasNext) setPage((prev) => prev + 1);
  };

  const goPrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const filledItems = [...items];

  while (filledItems.length < PAGE_SIZE) {
    filledItems.push({
      id: `placeholder-${page}-${filledItems.length}`,
      titulo: "Próximamente",
      imagenes: [],
    });
  }

  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-center">
          <h2 className="text-center text-xl font-black uppercase tracking-[0.22em] text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.18)] sm:text-2xl lg:text-3xl">
            Últimos Post
          </h2>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
          <div className="flex items-center justify-center md:w-[110px] md:flex-shrink-0">
            <div className="relative w-full overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-[#09122f] via-[#10245f] to-[#09122f] px-4 py-3 shadow-[0_0_25px_rgba(34,211,238,0.12)] md:flex md:h-full md:min-h-[250px] md:items-center md:justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_45%)]" />
              <div className="absolute inset-y-3 left-2 w-[2px] rounded-full bg-gradient-to-b from-cyan-300 via-blue-400 to-cyan-300 opacity-80 md:left-auto md:top-3 md:bottom-3 md:right-1/2 md:h-auto md:w-[2px] md:translate-x-10" />

              <span className="relative text-lg font-black uppercase tracking-[0.28em] text-cyan-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)] md:[writing-mode:vertical-rl] md:rotate-180">
                {title}
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/0 via-cyan-300/30 to-cyan-400/0" />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={page === 1}
                  aria-label={`Ir al bloque anterior de ${title}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-br from-[#10245f] to-[#09122f] text-white shadow-[0_0_15px_rgba(34,211,238,0.12)] transition hover:scale-105 hover:border-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!hasNext}
                  aria-label={`Ir al siguiente bloque de ${title}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-br from-[#10245f] to-[#09122f] text-white shadow-[0_0_15px_rgba(34,211,238,0.12)] transition hover:scale-105 hover:border-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible xl:grid-cols-5">
              {filledItems.map((item, index) => {
                const isPlaceholder = item.id.startsWith("placeholder");
                const image = item.imagenes?.[0];

                if (isPlaceholder) {
                  return (
                    <div
                      key={item.id || index}
                      className="group h-[250px] min-w-[260px] snap-start overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-b from-slate-950/80 via-[#0d1f52]/70 to-slate-950/90 shadow-[0_0_18px_rgba(34,211,238,0.06)] sm:min-w-0"
                    >
                      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                          <Clock3 className="h-7 w-7" />
                        </div>

                        <h3 className="text-lg font-bold text-white">
                          Próximamente
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-blue-100/65">
                          Esta sección tendrá más contenido muy pronto.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={`/publicaciones/${item.id}`}
                    className="group block h-[250px] min-w-[260px] snap-start overflow-hidden rounded-2xl border border-blue-700/20 bg-gradient-to-b from-[#08122e] to-[#0e2156] shadow-[0_0_18px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/60 hover:shadow-[0_0_24px_rgba(34,211,238,0.16)] sm:min-w-0"
                  >
                    <div className="relative h-[170px] w-full overflow-hidden bg-slate-950">
                      {image ? (
                        <img
                          src={image}
                          alt={item.titulo}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 text-blue-200/70">
                          Sin imagen
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-cyan-400/0 via-cyan-300/70 to-cyan-400/0 opacity-0 transition duration-300 group-hover:opacity-100" />
                    </div>

                    <div className="flex h-[80px] items-center px-4">
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-white sm:text-lg">
                        {item.titulo}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>

            {loading && (
              <p className="mt-4 text-center text-blue-300">
                Cargando...
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}