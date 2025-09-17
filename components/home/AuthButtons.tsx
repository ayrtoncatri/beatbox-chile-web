"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type CustomUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  nombres?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
};

export default function AuthButtons() {
  const { data: session } = useSession();
  const router = useRouter();

  const user = session?.user as CustomUser | undefined;

  if (session) {
    return (
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-blue-700/40 shadow-lg border border-blue-800/40 backdrop-blur-md">
        <Image
          src={
            user?.image
              ? user.image
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  (user?.nombres || "") +
                    (user?.apellidoPaterno ? " " + user.apellidoPaterno : "")
                )}&background=3b82f6&color=fff&size=128`
          }
          alt="Foto de perfil"
          width={40}
          height={40}
          className="rounded-full border-2 border-blue-500 shadow-md object-cover"
        />
        <span className="text-blue-100 font-medium text-base md:text-lg whitespace-nowrap">
          Hola, <Link href='/perfil' className="font-bold">{user?.nombres} {user?.apellidoPaterno} {user?.apellidoMaterno}</Link>
        </span>
        <button
          className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white px-5 py-2 rounded-lg font-semibold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-blue-700/40 shadow-lg border border-blue-800/40 backdrop-blur-md">
      <button
        className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white px-5 py-2 rounded-lg font-semibold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => router.push("/auth/login")}
      >
        Iniciar Sesión
      </button>
      <button
        className="bg-white/90 text-blue-900 font-semibold px-5 py-2 rounded-lg shadow-md border border-blue-900/20 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => router.push("/auth/register")}
      >
        Registrarse
      </button>
    </div>
  );
}