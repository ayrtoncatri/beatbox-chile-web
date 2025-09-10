'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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
    <div className="w-full max-w-sm rounded-xl bg-neutral-900 p-8 text-center shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-white">Iniciar sesión</h2>

      {registered && <p className="mb-2 text-green-400">¡Registro exitoso! Inicia sesión.</p>}

      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="mb-4 w-full rounded-lg bg-blue-700 py-2 font-semibold text-white"
      >
        Continuar con Google
      </button>

      <form onSubmit={handleLogin} className="mt-2">
        <input
          className="mb-3 w-full rounded p-2 text-white placeholder:text-white placeholder:opacity-100"
          name="email" type="email" placeholder="Correo" required
        />
        <input
          className="mb-3 w-full rounded p-2 text-white placeholder:text-white placeholder:opacity-100"
          name="password" type="password" placeholder="Contraseña" required
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-800 py-2 font-semibold text-white"
        >
          {isPending ? "Ingresando…" : "Iniciar sesión"}
        </button>
      </form>

      {error && <p className="mt-3 text-red-400">{error}</p>}

      <button className="mt-4 underline text-blue-200" onClick={() => router.push("/auth/register")}>
        ¿No tienes cuenta? Regístrate
      </button>

      {/* Si quieres mantener styled-jsx, aquí SÍ puedes porque es client: 
      <style jsx>{`input::placeholder{color:white;opacity:1}`}</style> */}
    </div>
  );
}
