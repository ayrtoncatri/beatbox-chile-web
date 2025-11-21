"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";

// Utilidades OWASP
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function sanitize(input: string) {
  return input.replace(/[<>"'`\\]/g, "");
}

export default function LoginClient({
  registered,
  callbackUrl = "/",
}: { registered?: boolean; callbackUrl?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const email = sanitize((form.elements.namedItem("email") as HTMLInputElement).value.trim());
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!email || !password) {
      toast.error("Correo y contraseña son obligatorios.");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Correo inválido.");
      return;
    }

    const loadingToast = toast.loading("Iniciando sesión...");
    const res = await signIn("credentials", { redirect: false, email, password, callbackUrl });

    if (res?.error) {
      toast.error("Credenciales inválidas", { id: loadingToast });
    } else {
      toast.success("¡Sesión iniciada correctamente! Redirigiendo...", { id: loadingToast });
      startTransition(() => {
        setTimeout(() => router.push(callbackUrl), 500);
      });
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center
                     bg-gradient-to-b from-black via-blue-950 to-neutral-900">

      {/* 🔥 CONTENEDOR PRINCIPAL — MISMO ESTILO QUE REGISTER */}
      <div className="w-full max-w-md mx-auto rounded-3xl
                      bg-gradient-to-b from-[#0b0b11]/95 via-[#0d0d14]/95 to-[#09090f]/95
                      p-10 text-center shadow-[0_0_40px_rgba(255,0,70,0.15)]
                      border border-red-600/20 backdrop-blur-2xl">

        {/* 🔥 TITULO ESTILO BEATBOX */}
        <h2 className="mb-8 text-4xl font-black italic uppercase tracking-wide text-white">
          Acceso <span className="text-red-500">Autorizado</span>
        </h2>

        {registered && (
          <p className="mb-4 text-green-400 font-black italic">
            ¡Registro exitoso! Ingresa con tus credenciales.
          </p>
        )}

        {/* 🔵 GOOGLE BUTTON — MISMO ESTILO QUE REGISTER */}
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="mb-8 w-full flex items-center justify-center gap-3
                     rounded-xl bg-[#111827]/70 hover:bg-[#1e293b]/70
                     transition py-3 font-black italic uppercase tracking-wider
                     text-white shadow-lg border border-blue-500/30"
        >
          <span>Continuar con Google</span>
          <Image src="/icons8-google.svg" alt="Google" width={24} height={24} />
        </button>

        {/* FORMULARIO */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5" autoComplete="off">

          {/* INPUT CORREO */}
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            required
            maxLength={100}
            className="w-full rounded-xl bg-[#0f0f15]/80 border border-white/10
                       px-4 py-3 text-white placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-red-500
                       transition"
          />

          {/* INPUT CONTRASEÑA */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña de acceso"
              required
              className="w-full rounded-xl bg-[#0f0f15]/80 border border-white/10
                         px-4 py-3 pr-12 text-white placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />

            {/* ICÓN EYE */}
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-200 transition"
            >
              {showPassword ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2"
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2"
                    d="M17.94 17.94C16.11 19.25 14.13 20 12 20c-7 0-11-8-11-8
                       a21.77 21.77 0 0 1 5.06-6.06" />
                  <path stroke="currentColor" strokeWidth="2"
                    d="M1 1l22 22" />
                </svg>
              )}
            </button>
          </div>

          {/* BOTÓN PRINCIPAL */}
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-red-600 to-fuchsia-600
                       hover:from-red-700 hover:to-fuchsia-700 transition-all py-3
                       font-black italic uppercase tracking-wider text-white shadow-xl
                       shadow-red-900/40 focus:ring-2 focus:ring-fuchsia-400/50
                       disabled:opacity-50"
          >
            {isPending ? "Ingresando…" : "Iniciar Sesión"}
          </button>
        </form>

        {/* TEXTO IR A REGISTRO */}
        <p className="mt-8 text-blue-200 text-sm">
          ¿No tienes cuenta?{" "}
          <button
            onClick={() => router.push("/auth/register")}
            className="font-black italic text-cyan-300 hover:text-cyan-100 transition"
          >
            Regístrate <span className="text-red-400">aquí</span>.
          </button>
        </p>
      </div>
    </main>
  );
}
