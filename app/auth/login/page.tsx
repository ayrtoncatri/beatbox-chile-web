"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [error, setError] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Credenciales inválidas");
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-black via-blue-950 to-neutral-900">
      <div className="bg-neutral-900 rounded-xl p-8 shadow-lg w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Iniciar sesión</h2>
        {registered && <p className="text-green-400 mb-2">¡Registro exitoso! Inicia sesión.</p>}
        <button
          onClick={() => signIn("google")}
          className="w-full bg-blue-700 text-white py-2 rounded-lg mb-4 font-semibold"
        >
          Continuar con Google
        </button>
        <form onSubmit={handleLogin} className="mt-2">
          <input className="mb-3 w-full p-2 rounded" name="email" type="email" placeholder="Correo" required />
          <input className="mb-3 w-full p-2 rounded" name="password" type="password" placeholder="Contraseña" required />
          <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded-lg font-semibold">
            Iniciar sesión
          </button>
        </form>
        {error && <p className="text-red-400 mt-3">{error}</p>}
        <button
          className="mt-4 underline text-blue-200"
          onClick={() => router.push("/auth/register")}
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </main>
  );
}
