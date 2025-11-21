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
        router.push("/auth/login?registered=1");
      } else {
        const data = await res.json();
        setError(data.error || "No se pudo registrar. Intente más tarde.");
      }
    } catch (err) {
      setError("Error de red. Por favor, intente de nuevo.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center
                     bg-gradient-to-b from-black via-blue-950 to-neutral-900">

      {/* CONTENEDOR PRINCIPAL (Igual Login) */}
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md mx-auto rounded-3xl
                   bg-gradient-to-b from-[#0b0b11]/95 via-[#0d0d14]/95 to-[#09090f]/95
                   p-10 text-center shadow-[0_0_40px_rgba(255,0,70,0.15)]
                   border border-red-600/20 backdrop-blur-2xl"
        autoComplete="off"
      >
        {/* TÍTULO IGUAL AL LOGIN */}
        <h2 className="mb-8 text-4xl font-black italic uppercase tracking-wide text-white">
          Registro <span className="text-red-500">Autorizado</span>
        </h2>

        {/* Google Button — Idéntico a Login */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mb-8 w-full flex items-center justify-center gap-3
                     rounded-xl bg-[#111827]/70 hover:bg-[#1e293b]/70
                     transition py-3 font-black italic uppercase tracking-wider
                     text-white shadow-lg border border-blue-500/30"
        >
          <span>Continuar con Google</span>
          <Image src="/icons8-google.svg" alt="Google Logo" width={24} height={24} />
        </button>

        {/* CAMPOS DE REGISTRO */}
        <div className="flex flex-col gap-4 mb-4">
          <input
            className="rounded-xl bg-[#0f0f15]/80 border border-white/10 px-4 py-3
                       text-white placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            name="nombres"
            type="text"
            placeholder="Nombres"
            required
            disabled={loading}
          />

          <input
            className="rounded-xl bg-[#0f0f15]/80 border border-white/10 px-4 py-3
                       text-white placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            name="apellidoPaterno"
            type="text"
            placeholder="Apellido paterno"
            required
            disabled={loading}
          />

          <input
            className="rounded-xl bg-[#0f0f15]/80 border border-white/10 px-4 py-3
                       text-white placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            name="apellidoMaterno"
            type="text"
            placeholder="Apellido materno (opcional)"
            disabled={loading}
          />

          <input
            className="rounded-xl bg-[#0f0f15]/80 border border-white/10 px-4 py-3
                       text-white placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            required
            disabled={loading}
          />

          {/* Password */}
          <div className="relative">
            <input
              className="rounded-xl bg-[#0f0f15]/80 border border-white/10 px-4 py-3 pr-12
                         text-white placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña de acceso"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-200 transition"
            >
              {showPassword ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2"
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2"
                    d="M17.94 17.94C16.11 19.25 14.13 20 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.06"/>
                  <path stroke="currentColor" strokeWidth="2" d="M1 1l22 22"/>
                </svg>
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              className="rounded-xl bg-[#0f0f15]/80 border border-white/10 px-4 py-3 pr-12
                         text-white placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar contraseña"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-200 transition"
            >
              {showConfirm ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2"
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2"
                    d="M17.94 17.94C16.11 19.25 14.13 20 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.06"/>
                  <path stroke="currentColor" strokeWidth="2" d="M1 1l22 22"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Botón Crear Cuenta */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-red-600 to-fuchsia-600
                     hover:from-red-700 hover:to-fuchsia-700 transition-all py-3
                     font-black italic uppercase tracking-wider text-white shadow-xl
                     shadow-red-900/40 focus:ring-2 focus:ring-fuchsia-400/50"
        >
          Crear Cuenta
        </button>

        {/* Mensaje de Error */}
        {error && <p className="text-red-400 mt-4 font-black italic">{error}</p>}
      </form>

      {/* Enlace Login */}
      <p className="mt-6 text-blue-200 text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/auth/login"
          className="font-black italic text-cyan-300 hover:text-cyan-100 transition"
        >
          Inicia sesión <span className="text-red-400">aquí</span>.
        </Link>
      </p>
    </main>
  );
}
