import Link from "next/link";

import { COOKIE_POLICY_SECTIONS, COOKIE_POLICY_VERSION } from "@/lib/cookies-policy";

export const metadata = {
  title: "Politica de cookies | Beatbox Chile",
  description: "Cookies necesarias y contenidos de terceros (YouTube) - Ley 21.719.",
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-[70vh] bg-[#05070d] px-4 py-12 text-white">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
            Version {COOKIE_POLICY_VERSION}
          </p>
          <h1 className="font-heading text-4xl font-black uppercase italic tracking-wide sm:text-5xl">
            Politica de cookies
          </h1>
          <p className="text-white/70">
            Inventario de cookies e identificadores de Beatbox Chile, alineado a la Ley 21.719.
          </p>
        </header>

        {COOKIE_POLICY_SECTIONS.map((section) => (
          <section key={section.title} className="space-y-2 border-t border-white/10 pt-6">
            <h2 className="text-xl font-bold text-cyan-100">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-sm leading-relaxed text-white/75">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <div className="flex flex-wrap gap-4 border-t border-white/10 pt-6 text-sm">
          <Link
            href="/privacidad"
            className="rounded-xl border border-white/20 px-4 py-2 text-white/80"
          >
            Politica de privacidad
          </Link>
          <Link
            href="/privacidad/derechos"
            className="rounded-xl bg-cyan-500 px-4 py-2 font-bold uppercase tracking-wide text-black"
          >
            Ejercer derechos
          </Link>
        </div>
        <p className="text-xs text-white/45">
          Para cambiar tu eleccion usa «Gestionar cookies» en el pie de pagina.
        </p>
      </article>
    </main>
  );
}
