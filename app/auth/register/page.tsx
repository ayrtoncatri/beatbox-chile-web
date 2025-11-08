"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

// Utilidades OWASP
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isStrongPassword(password: string) {
  // Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}
function sanitize(input: string) {
  // Remueve caracteres peligrosos básicos
  return input.replace(/[<>"'`\\]/g, "");
}

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);
    setError("");

    const nombres = sanitize(e.target.nombres.value.trim());
    const apellidoPaterno = sanitize(e.target.apellidoPaterno.value.trim());
    const apellidoMaterno = sanitize(e.target.apellidoMaterno.value.trim()) || "";
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (!nombres || !apellidoPaterno || !email || !password || !confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Correo inválido.");
      return;
    }
    if (!isStrongPassword(password)) {
      setError("La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nombres,
          apellidoPaterno,
          apellidoMaterno,
          email,
          password,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Éxito: Redirigir al login
        router.push("/auth/login?registered=1");
      } else {
        const data = await res.json();
        setError(data.error || "No se pudo registrar. Intente más tarde.");
      }
    } catch (err) {
      setError("Error de red. Por favor, intente de nuevo.");
    }

    setLoading(false); // Detener la carga
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-black via-blue-950 to-neutral-900">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-blue-900/80 via-neutral-900/90 to-blue-950/80 p-8 text-center shadow-2xl border border-blue-800/40 backdrop-blur-lg"
        autoComplete="off"
      >
        <h2 className="text-3xl font-extrabold text-blue-100 mb-6 drop-shadow">
          Registrarse
        </h2>
        
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mb-6 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 transition py-2 font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-gray-100 placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="nombres"
            type="text"
            placeholder="Nombres"
            required
            maxLength={50}
            autoComplete="off"
            disabled={loading}
          />
          <input
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="apellidoPaterno"
            type="text"
            placeholder="Apellido paterno"
            required
            maxLength={50}
            autoComplete="off"
            disabled={loading}
          />
          <input
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="apellidoMaterno"
            type="text"
            placeholder="Apellido materno"
            maxLength={50}
            autoComplete="off"
            disabled={loading}
          />
          <input
            className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="email"
            type="email"
            placeholder="Correo"
            required
            maxLength={100}
            autoComplete="off"
            disabled={loading}
          />
          <div className="relative">
            <input
              className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 pr-10 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-100 disabled:opacity-50"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              disabled={loading}
            >
              {showPassword ? (
                // Ojo abierto
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
              ) : (
                // Ojo cerrado
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M17.94 17.94C16.11 19.25 14.13 20 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.06M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12"/><path stroke="currentColor" strokeWidth="2" d="m1 1 22 22"/></svg>
              )}
            </button>
          </div>
          <div className="relative">
            <input
              className="rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 pr-10 text-white placeholder:text-blue-200 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar contraseña"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-100"
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirm ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M17.94 17.94C16.11 19.25 14.13 20 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.06M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12"/><path stroke="currentColor" strokeWidth="2" d="m1 1 22 22"/></svg>
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white py-2 font-bold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Registrarme
        </button>
        {error && <p className="text-red-400 mt-4 font-semibold">{error}</p>}
      </form>

      <p className="text-blue-200/90 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/auth/login"
          className="font-bold text-blue-400 hover:text-blue-300 transition"
        >
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}