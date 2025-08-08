"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthButtons() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    return (
      <div className="flex justify-center gap-4 mt-6">
        <span className="text-blue-100">Hola, {session.user?.name}</span>
        <button
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-4 mt-6">
      <button
        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold"
        onClick={() => router.push("/auth/login")}
      >
        Iniciar Sesión
      </button>
      <button
        className="bg-white text-blue-900 font-semibold px-6 py-2 rounded-lg shadow border border-blue-900 transition hover:bg-blue-100"
        onClick={() => router.push("/auth/register")}
      >
        Registrarse
      </button>
    </div>
  );
}
