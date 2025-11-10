'use client';

import type { PublicWildcardsData } from "@/app/actions/public-data";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/solid";
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

// Prop: Acepta un solo objeto del array que devuelve 'getPublicWildcardsForEvent'
type WildcardVideoCardProps = {
  wildcard: PublicWildcardsData[0]; // Tipado fuerte
};

/**
 * Función helper para extraer el ID de un video de YouTube
 */
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    // 1. Para URLs estándar (youtube.com/watch?v=...)
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }
    // 2. Para URLs cortas (youtu.be/...)
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1); // Quita el '/' inicial
    }
  } catch (error) {
    console.error("URL de YouTube inválida:", url, error);
    return null;
  }
  return null;
}

export function WildcardVideoCard({ wildcard }: WildcardVideoCardProps) {
  const videoId = getYouTubeVideoId(wildcard.youtubeUrl);

  return (
    // Usamos los mismos estilos de tarjeta que tu panel de admin
    <article className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 
      backdrop-blur-lg border border-blue-700/30 overflow-hidden 
      flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/20"
    >
      
      {/* --- Reproductor de Video --- */}
      <div className="w-full">
        {videoId ? (
          // Contenedor responsivo que mantiene la proporción 16:9
          <div className="aspect-video bg-black/50">
            <LiteYouTubeEmbed
              id={videoId}
              title={`Wildcard de ${wildcard.nombreArtistico}`}
              adNetwork={false}
              noCookie={true}
            />
          </div>
        ) : (
          // Fallback si la URL es inválida
          <div className="aspect-video bg-black/50 flex items-center justify-center">
            <p className="text-red-400 text-sm">Video no disponible</p>
          </div>
        )}
      </div>

      {/* --- Información del Artista --- */}
      <div className="p-5 flex-grow">
        <Link 
          href={`/historial-competitivo/competidores/${wildcard.userId}`} // Enlace al perfil del competidor
          className="group"
        >
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">
            {wildcard.nombreArtistico}
          </h3>
          <span className="flex items-center gap-1.5 text-sm text-blue-300/70 group-hover:text-blue-300 transition-colors">
            <UserIcon className="w-3 h-3" />
            Ver perfil
          </span>
        </Link>
      </div>
    </article>
  );
}