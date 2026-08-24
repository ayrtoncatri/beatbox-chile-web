"use client";

import { useCallback, useEffect, useState } from "react";
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

  const fetchData = useCallback(async (newPage: number) => {
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
  }, [tipo]);

  useEffect(() => {
    fetchData(page);
  }, [page, tipo, fetchData]);

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
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
          <div className="flex items-center justify-between gap-3 md:w-[92px] md:flex-shrink-0 md:flex-col md:justify-between">
            <span className="home-title text-3xl text-fuchsia-300 md:hidden">{title}</span>
            <span className="home-vert hidden text-5xl text-fuchsia-300 md:block">{title}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={page === 1}
                aria-label={`Ir al bloque anterior de ${title}`}
                className="flex h-11 w-11 items-center justify-center border border-fuchsia-300/40 bg-black/40 text-white transition hover:border-cyan-300 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!hasNext}
                aria-label={`Ir al siguiente bloque de ${title}`}
                className="flex h-11 w-11 items-center justify-center border border-fuchsia-300/40 bg-black/40 text-white transition hover:border-cyan-300 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-1 md:gap-3 md:overflow-visible xl:grid-cols-2">
              {filledItems.map((item, index) => {
                const isPlaceholder = item.id.startsWith("placeholder");
                const image = item.imagenes?.[0];

                if (isPlaceholder) {
                  return (
                    <div
                      key={item.id || index}
                      className="home-card home-card-violet flex min-w-[280px] items-center gap-4 p-3 sm:min-w-0"
                    >
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-white/10 bg-black/40 text-cyan-200">
                        <Clock3 className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Próximamente</h3>
                        <p className="mt-1 text-sm leading-6 text-white/60">
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
                    className="home-card home-card-cyan group flex min-w-[280px] items-center gap-4 p-3 transition duration-300 hover:border-fuchsia-300/70 sm:min-w-0"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-cyan-300/30 bg-slate-950">
                      {image ? (
                        <img
                          src={image}
                          alt={item.titulo}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-black text-xs text-white/50">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-white sm:text-lg">
                        {item.titulo}
                      </h3>
                      <span className="mt-2 inline-block text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                        Leer más
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {loading && (
              <p className="mt-4 text-center text-cyan-200">
                Cargando...
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
