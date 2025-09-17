"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    const nombres = e.target.nombres.value;
    const apellidoPaterno = e.target.apellidoPaterno.value;
    const apellidoMaterno = e.target.apellidoMaterno.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ nombres, apellidoPaterno, apellidoMaterno, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/auth/login?registered=1");
    } else {
      setError("Error al registrar. ¿El correo ya está en uso?");
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-black via-blue-950 to-neutral-900">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-blue-900/80 via-neutral-900/90 to-blue-950/80 p-8 text-center shadow-2xl border border-blue-800/40 backdrop-blur-lg"
      >
        <h2 className="text-3xl font-extrabold text-blue-100 mb-6 drop-shadow">Registrarse</h2>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mb-6 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 transition py-2 font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <span>Registrarse con Google</span>
          <Image
            src="/icons8-google.svg"
            alt="Google Logo"
            width={22}
            height={22}
            className="inline-block"
          />
        </button>
        <div className="flex flex-col gap-3 mb-2">
          <input
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="nombres"
            type="text"
            placeholder="Nombres"
            required
          />
          <input
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="apellidoPaterno"
            type="text"
            placeholder="Apellido paterno"
            required
          />
          <input
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="apellidoMaterno"
            type="text"
            placeholder="Apellido materno"
            required
          />
          <input
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="email"
            type="email"
            placeholder="Correo"
            required
          />
          <input
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="password"
            type="password"
            placeholder="Contraseña"
            required
          />
          <input
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white py-2 font-bold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Registrarme
        </button>
        {error && <p className="text-red-400 mt-4 font-semibold">{error}</p>}
      </form>
    </main>
  );
}