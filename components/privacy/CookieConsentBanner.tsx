"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCookieConsent } from "@/components/privacy/CookieConsentProvider";

export default function CookieConsentBanner() {
  const pathname = usePathname();
  const { showBanner, allowNecessaryOnly, allowThirdParty } = useCookieConsent();

  if (!showBanner) return null;
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/judge")) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl border border-cyan-300/35 bg-[#071018]/95 p-4 shadow-[0_0_28px_rgba(34,211,238,0.18)] backdrop-blur-md sm:p-5">
        <h2
          id="cookie-banner-title"
          className="font-[family-name:var(--font-display)] text-lg font-bold uppercase italic text-white sm:text-xl"
        >
          Cookies y contenidos de terceros
        </h2>
        <p id="cookie-banner-desc" className="mt-2 max-w-prose text-sm leading-relaxed text-white/75">
          Usamos cookies necesarias para tu cuenta, seguridad y recordar esta eleccion.
          YouTube (Google) solo se carga en wildcards publicas si lo autorizas.
          Por defecto no cargamos terceros.{" "}
          <Link href="/privacidad/cookies" className="text-cyan-200 underline underline-offset-2">
            Politica de cookies
          </Link>
          {" · "}
          <Link href="/privacidad" className="text-cyan-200 underline underline-offset-2">
            Privacidad
          </Link>
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={allowNecessaryOnly}
            className="inline-flex min-h-12 flex-1 items-center justify-center border border-white/25 px-4 text-sm font-bold uppercase tracking-wide text-white hover:border-cyan-300/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            Solo necesarias
          </button>
          <button
            type="button"
            onClick={allowThirdParty}
            className="home-cta inline-flex min-h-12 flex-1 items-center justify-center px-4 text-sm"
          >
            Aceptar YouTube
          </button>
        </div>
      </div>
    </div>
  );
}
