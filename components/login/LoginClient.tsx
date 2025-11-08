'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from 'next/image';
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
        setTimeout(() => {
          router.push(callbackUrl);
        }, 500);
      });
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-blue-900/80 via-neutral-900/90 to-blue-950/80 p-8 text-center shadow-2xl border border-blue-800/40 backdrop-blur-lg">
      <h2 className="mb-6 text-3xl font-extrabold text-blue-100 drop-shadow">Iniciar sesión</h2>

      {registered && <p className="mb-4 text-green-400 font-semibold">¡Registro exitoso! Inicia sesión.</p>}

      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="mb-6 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 transition py-2 font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <span>Continuar con Google</span>
        <Image
          src="/icons8-google.svg"
          alt="Google Logo"
          width={22}
          height={22}
          className="inline-block"
        />
      </button>

      <form onSubmit={handleLogin} className="mt-2 flex flex-col gap-4" autoComplete="off">
        <input
          className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          name="email" type="email" placeholder="Correo" required maxLength={100} autoComplete="off"
        />
        <div className="relative">
          <input
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 pr-10 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            required
            minLength={8}
            autoComplete="current-password"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-100"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
            ) : (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M17.94 17.94C16.11 19.25 14.13 20 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.06M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12"/><path stroke="currentColor" strokeWidth="2" d="m1 1 22 22"/></svg>
            )}
          </button>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white py-2 font-bold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {isPending ? "Ingresando…" : "Iniciar sesión"}
        </button>
      </form>

      <button
        className="mt-6 underline text-blue-300 hover:text-blue-100 transition font-medium"
        onClick={() => router.push("/auth/register")}
      >
        ¿No tienes cuenta? Regístrate
      </button>
    </div>
  );
}