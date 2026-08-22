"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type MfaClientProps = {
  mode: "setup" | "challenge";
  callbackUrl: string;
};

type SetupData = {
  qrCodeDataUrl: string;
  recoveryCodes: string[];
};

export default function MfaClient({ mode, callbackUrl }: MfaClientProps) {
  const router = useRouter();
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  const requestSetup = async () => {
    setPending(true);
    try {
      const response = await fetch("/api/auth/mfa/setup", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No fue posible preparar MFA");
      setSetupData(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible preparar MFA");
    } finally {
      setPending(false);
    }
  };

  const submitCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    try {
      const endpoint = mode === "setup" ? "/api/auth/mfa/confirm" : "/api/auth/mfa/challenge";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Codigo MFA invalido");

      if (mode === "setup") {
        toast.success("MFA activado. Ahora verifica tu segundo factor para continuar.");
        router.replace(`/auth/mfa/challenge?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible verificar MFA");
    } finally {
      setPending(false);
    }
  };

  const isSetup = mode === "setup";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-blue-950 to-neutral-900 p-4">
      <section className="w-full max-w-lg border border-red-600/20 bg-[#0b0b11]/95 p-8 text-white shadow-[0_0_40px_rgba(255,0,70,0.15)]">
        <h1 className="text-3xl font-black italic uppercase tracking-wide">
          Verificacion <span className="text-red-500">MFA</span>
        </h1>
        <p className="mt-3 text-sm text-white/70">
          {isSetup
            ? "Configura una aplicacion autenticadora para proteger el acceso privilegiado."
            : "Ingresa el codigo de tu aplicacion autenticadora o un codigo de recuperacion."}
        </p>

        {isSetup && !setupData && (
          <button
            type="button"
            onClick={requestSetup}
            disabled={pending}
            className="mt-6 w-full bg-red-600 px-4 py-3 font-bold uppercase disabled:opacity-50"
          >
            {pending ? "Preparando..." : "Generar configuracion MFA"}
          </button>
        )}

        {isSetup && setupData && (
          <div className="mt-6 space-y-5">
            <div className="bg-white p-3">
              <Image src={setupData.qrCodeDataUrl} alt="Codigo QR de MFA" width={256} height={256} className="mx-auto" unoptimized />
            </div>
            <div>
              <h2 className="font-bold">Codigos de recuperacion</h2>
              <p className="mt-1 text-sm text-white/70">Guardalos en un lugar seguro. Se muestran una sola vez y cada uno se usa una vez.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 bg-black/30 p-3 font-mono text-sm">
                {setupData.recoveryCodes.map((recoveryCode) => <span key={recoveryCode}>{recoveryCode}</span>)}
              </div>
            </div>
          </div>
        )}

        {(!isSetup || setupData) && (
          <form onSubmit={submitCode} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold" htmlFor="mfa-code">
              Codigo de autenticacion
            </label>
            <input
              id="mfa-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={32}
              required
              className="w-full border border-white/20 bg-black/30 px-4 py-3 font-mono tracking-widest outline-none focus:border-red-400"
              placeholder="000000"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-red-600 px-4 py-3 font-bold uppercase disabled:opacity-50"
            >
              {pending ? "Verificando..." : isSetup ? "Activar MFA" : "Verificar y continuar"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
