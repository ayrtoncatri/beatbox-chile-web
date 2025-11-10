"use client";
import React, { useEffect, useState } from "react";
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

type Wildcard = {
  id: string;
  youtubeUrl: string;
  nombreArtistico: string;
  categoria?: string; 
};

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export default function ListaWildcards() {
  const [wildcards, setWildcards] = useState<Wildcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wildcard") 
      .then((res) => res.json())
      .then((data) => {
        setWildcards(data.wildcards || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-white mt-8">Cargando wildcards...</div>;
  if (!wildcards.length)
    return <div className="text-white mt-8">Aún no hay wildcards enviadas.</div>;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-lime-400 mb-6 text-center">
        Wildcards enviadas
      </h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {wildcards.map((w) => {
          const ytId = getYouTubeId(w.youtubeUrl);
          return (
            <div
              key={w.id}
              className="bg-black/70 rounded-lg p-4 flex flex-col items-center border border-lime-500"
            >
              <div className="mb-2 text-lime-300 font-semibold text-lg">
                {w.nombreArtistico || "Anónimo"}
              </div>
              {w.categoria && (
                <div className="mb-2 text-lime-200 text-sm">
                  Categoría: <span className="font-bold">{w.categoria}</span>
                </div>
              )}
              {ytId ? (
                <LiteYouTubeEmbed
                    id={ytId}
                    title={`Wildcard de ${w.nombreArtistico}`}
                    adNetwork={false}
                    noCookie={true}
                />
              ) : (
                <div className="text-red-400">Video no válido</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}