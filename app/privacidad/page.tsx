import Link from "next/link";

import {
  PRIVACY_NOTICE_HASH,
  PRIVACY_NOTICE_TEXT,
  PRIVACY_NOTICE_VERSION,
  PRIVACY_POLICY_SECTIONS,
} from "@/lib/privacy";

export const metadata = {
  title: "Politica de Privacidad | Beatbox Chile",
  description: "Politica de privacidad y tratamiento de datos personales - Beatbox Chile (Ley 21.719).",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-[70vh] bg-[#05070d] px-4 py-12 text-white">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
            Version {PRIVACY_NOTICE_VERSION}
          </p>
          <h1 className="font-heading text-4xl font-black uppercase italic tracking-wide sm:text-5xl">
            Politica de Privacidad
          </h1>
          <p className="text-white/70">
            Aviso corto aceptado en registro: {PRIVACY_NOTICE_TEXT}
          </p>
          <p className="break-all text-xs text-white/45">
            Hash SHA-256 del aviso: {PRIVACY_NOTICE_HASH}
          </p>
        </header>

        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <section key={section.title} className="space-y-2 border-t border-white/10 pt-6">
            <h2 className="text-xl font-bold text-cyan-100">{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="text-sm leading-relaxed text-white/75">
                {p}
              </p>
            ))}
          </section>
        ))}

        <div className="flex flex-wrap gap-4 border-t border-white/10 pt-6 text-sm">
          <Link
            href="/privacidad/derechos"
            className="rounded-xl bg-cyan-500 px-4 py-2 font-bold uppercase tracking-wide text-black"
          >
            Ejercer derechos
          </Link>
          <Link
            href="/privacidad/cookies"
            className="rounded-xl border border-white/20 px-4 py-2 text-white/80"
          >
            Politica de cookies
          </Link>
          <Link href="/" className="rounded-xl border border-white/20 px-4 py-2 text-white/80">
            Volver al inicio
          </Link>
        </div>

        <p className="text-xs text-white/40">
          DISCLAIMER: Este material no constituye asesoria legal. Es un borrador tecnico basado en
          normativa chilena (Ley 21.719). Los datos corporativos marcados [COMPLETAR] se publicaran
          cuando esten disponibles.
        </p>
      </article>
    </main>
  );
}
