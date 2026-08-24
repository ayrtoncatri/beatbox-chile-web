"use client";

import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

import { useCookieConsent } from "@/components/privacy/CookieConsentProvider";

type Props = {
  videoId: string;
  title: string;
  /** Paneles juez/admin: el video es necesario para el encargo, no se bloquea. */
  bypassConsent?: boolean;
};

export default function ConsentYouTubeEmbed({ videoId, title, bypassConsent = false }: Props) {
  const { thirdPartyAllowed, allowThirdParty } = useCookieConsent();
  const canLoad = bypassConsent || thirdPartyAllowed;

  if (canLoad) {
    return (
      <LiteYouTubeEmbed
        id={videoId}
        title={title}
        adNetwork={false}
        noCookie
      />
    );
  }

  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-black/55 p-4 text-center">
      <p className="max-w-sm text-sm leading-relaxed text-white/80">
        Este video se reproduce en YouTube (Google). No se carga hasta que lo autorices.
      </p>
      <button
        type="button"
        onClick={allowThirdParty}
        className="inline-flex min-h-12 items-center border border-cyan-300/50 px-4 text-sm font-bold uppercase tracking-wide text-cyan-100 hover:border-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
      >
        Autorizar y mostrar video
      </button>
    </div>
  );
}
