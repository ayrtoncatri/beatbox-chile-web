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
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
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
      <form onSubmit={handleRegister} className="bg-neutral-900 rounded-xl p-8 shadow-lg w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Registrarse</h2>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mb-4 w-full rounded-lg bg-blue-700 py-2 font-semibold text-white cursor-pointer"
        >
          Registrarse con Google

          <Image
            src="/icons8-google.svg"
            alt="Google Logo"
            width={25}
            height={25}
            className="ml-2 inline-block"
          />
        </button>
        <input className="mb-3 w-full p-2 rounded text-white" name="name" type="text" placeholder="Nombre" required />
        <input className="mb-3 w-full p-2 rounded text-white" name="email" type="email" placeholder="Correo" required />
        <input className="mb-3 w-full p-2 rounded text-white" name="password" type="password" placeholder="Contraseña" required />
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold">Registrarme</button>
        {error && <p className="text-red-400 mt-3">{error}</p>}
      </form>
      
      <style jsx>{`
        input::placeholder {
          color: white !important;
          opacity: 1 !important;
        }
        input::-webkit-input-placeholder {
          color: white !important;
          opacity: 1 !important;
        }
        input::-moz-placeholder {
          color: white !important;
          opacity: 1 !important;
        }
        input:-ms-input-placeholder {
          color: white !important;
          opacity: 1 !important;
        }
      `}</style>
    </main>
  );
}
