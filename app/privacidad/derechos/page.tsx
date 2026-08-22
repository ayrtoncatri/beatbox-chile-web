import Link from "next/link";
import { getServerSession } from "next-auth";

import PrivacyRightsForm from "@/components/privacy/PrivacyRightsForm";
import { authOptions } from "@/lib/auth";
import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy";

export const metadata = {
  title: "Ejercer derechos de privacidad | Beatbox Chile",
  description: "Canal para ejercer acceso, rectificacion, supresion, oposicion, portabilidad y bloqueo.",
};

export default async function PrivacyRightsPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-[70vh] bg-[#05070d] px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
          Ley 21.719 · Aviso {PRIVACY_NOTICE_VERSION}
        </p>
        <h1 className="font-heading text-4xl font-black uppercase italic tracking-wide">
          Ejercer tus derechos
        </h1>
        <p className="text-white/75">
          Plazo de respuesta: 30 dias corridos, prorrogable una sola vez por 30 dias.
          Rectificacion, supresion y oposicion son gratuitos. Acceso gratuito al menos una vez por trimestre.
        </p>
        <p className="text-sm text-white/60">
          Politica completa en{" "}
          <Link href="/privacidad" className="text-cyan-300 underline">
            /privacidad
          </Link>
          . Si ya iniciaste sesion, tambien puedes descargar tus datos en{" "}
          <a href="/api/privacy/export" className="text-cyan-300 underline">
            portabilidad JSON
          </a>
          .
        </p>
        <PrivacyRightsForm
          isAuthenticated={Boolean(session?.user?.email)}
          defaultEmail={session?.user?.email}
          defaultName={session?.user?.name}
        />
      </div>
    </main>
  );
}
