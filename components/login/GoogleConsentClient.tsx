"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function GoogleConsentClient({ callbackUrl }: { callbackUrl: string }) {
  const [privacyNoticeAccepted, setPrivacyNoticeAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const continueWithGoogle = async () => {
    if (!privacyNoticeAccepted || loading) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/google-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacyNoticeAccepted, marketingConsent }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "No fue posible registrar tu consentimiento.");
        setLoading(false);
        return;
      }

      await signIn("google", { callbackUrl });
    } catch {
      setError("No fue posible conectar con Google. Intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-black via-blue-950 to-neutral-900 px-4">
      <section className="w-full max-w-md border border-red-600/20 bg-[#0b0b11]/95 p-8 text-left text-blue-100 shadow-[0_0_40px_rgba(255,0,70,0.15)] backdrop-blur-2xl rounded-3xl">
        <h1 className="text-center text-3xl font-black italic uppercase tracking-wide text-white">
          Continuar con <span className="text-red-500">Google</span>
        </h1>
        <p className="mt-5 text-sm leading-6 text-blue-100">
          Antes de crear tu cuenta con Google, necesitamos registrar tu aceptación del aviso de privacidad.
        </p>

        <div className="mt-6 space-y-4 text-sm leading-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={privacyNoticeAccepted}
              onChange={(event) => setPrivacyNoticeAccepted(event.target.checked)}
              disabled={loading}
              className="mt-1 h-4 w-4 shrink-0 accent-red-500"
            />
            <span>
              He leído y acepto el tratamiento de mis datos para crear y administrar mi cuenta,
              conforme al{" "}
              <Link href="/privacidad" target="_blank" className="underline text-cyan-200">
                aviso de privacidad
              </Link>
              .
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(event) => setMarketingConsent(event.target.checked)}
              disabled={loading}
              className="mt-1 h-4 w-4 shrink-0 accent-red-500"
            />
            <span>Quiero recibir novedades y comunicaciones de Beatbox Chile por correo.</span>
          </label>
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-red-300">{error}</p>}

        <button
          type="button"
          onClick={continueWithGoogle}
          disabled={!privacyNoticeAccepted || loading}
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-blue-500/30 bg-[#111827]/70 py-3 font-black italic uppercase tracking-wider text-white transition hover:bg-[#1e293b]/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{loading ? "Conectando..." : "Continuar con Google"}</span>
          <Image src="/icons8-google.svg" alt="" width={24} height={24} />
        </button>

        <Link href="/auth/login" className="mt-5 block text-center text-sm font-semibold text-cyan-300 transition hover:text-cyan-100">
          Volver al inicio de sesión
        </Link>
      </section>
    </main>
  );
}
