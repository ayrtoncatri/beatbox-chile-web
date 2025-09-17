'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from 'next/image';

export default function LoginClient({
  registered,
  callbackUrl = "/",
}: { registered?: boolean; callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await signIn("credentials", { redirect: false, email, password, callbackUrl });
    if (res?.error) setError("Credenciales inválidas");
    else startTransition(() => router.push(callbackUrl));
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

      <form onSubmit={handleLogin} className="mt-2 flex flex-col gap-4">
        <input
          className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          name="email" type="email" placeholder="Correo" required
        />
        <input
          className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          name="password" type="password" placeholder="Contraseña" required
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white py-2 font-bold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {isPending ? "Ingresando…" : "Iniciar sesión"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-400 font-semibold">{error}</p>}

      <button
        className="mt-6 underline text-blue-300 hover:text-blue-100 transition font-medium"
        onClick={() => router.push("/auth/register")}
      >
        ¿No tienes cuenta? Regístrate
      </button>
    </div>
  );
}