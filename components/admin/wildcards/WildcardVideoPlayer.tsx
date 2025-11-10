"use client";

import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

type PlayerProps = {
  videoId: string;
  title: string;
};

export function WildcardVideoPlayer({ videoId, title }: PlayerProps) {
  // Este componente es un "puente" de Cliente
  // para poder usar la librería LiteYouTubeEmbed.
  return (
    <div className="aspect-video rounded-lg overflow-hidden">
      <LiteYouTubeEmbed
        id={videoId}
        title={title}
        adNetwork={false}
        noCookie={true}
      />
    </div>
  );
}